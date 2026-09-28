import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { unstable_dev } from "wrangler";

describe("Cloudflare Workers Baseline Runtime Suite (Migration Phase 1)", () => {
  let worker;

  before(async () => {
    // Spin up local Worker runtime instance using wrangler.json configuration
    worker = await unstable_dev("src/index.js", {
      config: "wrangler.json",
      experimental: { disableExperimentalWarning: true },
    });
  });

  after(async () => {
    if (worker) {
      await worker.stop();
    }
  });

  test("1. Worker starts and responds to GET /health with 200 OK", async () => {
    const res = await worker.fetch("/health");
    assert.equal(res.status, 200);

    const contentType = res.headers.get("content-type");
    assert.match(contentType, /application\/json/i);

    const body = await res.json();
    assert.equal(body.status, "healthy");
    assert.equal(body.runtime, "cloudflare-workers");
    assert.ok(Array.isArray(body.compatibilityFlags));
    assert.ok(body.uptimeSeconds >= 0);
  });

  test("2. Worker responds to GET / with 200 OK matching health contract", async () => {
    const res = await worker.fetch("/");
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, "healthy");
    assert.equal(body.runtime, "cloudflare-workers");
  });

  test("3. Unknown path returns 404 or expected fallback without isolate crash", async () => {
    const res = await worker.fetch("/non-existent-route-probe");
    // Verify Worker runtime handles arbitrary paths gracefully without crashing
    assert.ok(res.status === 404 || res.status === 200 || res.status === 400);
  });

  test("4. Worker executes bcryptjs hashing and jsonwebtoken signing inside V8 isolate (Migration Phase 2)", async () => {
    const res = await worker.fetch("/auth/crypto-test");
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.crypto.bcryptjsAvailable, true);
    assert.equal(body.crypto.hashGenerated, true);
    assert.equal(body.crypto.passwordMatched, true);
    assert.equal(body.crypto.wrongPasswordRejected, true);
    assert.equal(body.jwt.jsonwebtokenAvailable, true);
    assert.equal(body.jwt.tokenSigned, true);
    assert.equal(body.jwt.claimsPreserved, true);
  });

  test("5. Worker executes native ML placement predictor inside V8 isolate (Migration Phase 3)", async () => {
    const res = await worker.fetch("/ai/predictor-test");
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.phase3.nativePredictionAvailable, true);
    assert.equal(body.phase3.placedResult, "Placed");
    assert.equal(body.phase3.notPlacedResult, "Not Placed");
    assert.equal(body.phase3.zeroSubprocess, true);
  });

  test("6. Worker handles POST /api/v9/aiPredictor with contract parity (Migration Phase 3)", async () => {
    const res = await worker.fetch("/api/v9/aiPredictor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks: 85, attendance: 90, branch: "CSE" }),
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.prediction.result, "Placed");
    assert.equal(body.prediction.marks, 85);
    assert.equal(body.prediction.attendance, 90);
    assert.equal(body.prediction.branch, "CSE");

    // Test rejection of invalid input
    const badRes = await worker.fetch("/api/v9/aiPredictor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks: "invalid", attendance: 90 }),
    });
    assert.equal(badRes.status, 400);
  });

  test("7. Worker parses valid multipart file upload via native request.formData() (Migration Phase 4)", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4 header
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const form = new FormData();
    form.append("file", blob, "syllabus.pdf");

    const res = await worker.fetch("/upload/edge-test", {
      method: "POST",
      body: form,
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.phase4.edgeMultipartParsed, true);
    assert.equal(body.phase4.edgeCloudinaryRestReady, true);
    assert.equal(body.phase4.zeroNodeStreams, true);
    assert.equal(body.file.originalname, "syllabus.pdf");
    assert.equal(body.file.mimetype, "application/pdf");
    assert.ok(body.file.secure_url.includes("cloudinary.com"));
  });

  test("8. Worker rejects oversized upload exceeding 10MB limit (Migration Phase 4)", async () => {
    // 10.5 MB payload
    const oversizedBytes = new Uint8Array(10.5 * 1024 * 1024);
    const blob = new Blob([oversizedBytes], { type: "application/pdf" });
    const form = new FormData();
    form.append("file", blob, "large.pdf");

    const res = await worker.fetch("/upload/edge-test", {
      method: "POST",
      body: form,
    });
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /File too large/i);
  });

  test("9. Worker rejects executable files and spoofed MIME types (Migration Phase 4)", async () => {
    // PE executable with MZ header (0x4D, 0x5A)
    const exeBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]);
    const blob = new Blob([exeBytes], { type: "application/pdf" });
    const form = new FormData();
    form.append("file", blob, "malicious.pdf");

    const res = await worker.fetch("/upload/edge-test", {
      method: "POST",
      body: form,
    });
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /not allowed/i);
  });

  test("10. Worker sanitizes path traversal characters in filenames (Migration Phase 4)", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const form = new FormData();
    form.append("file", blob, "../../../etc/passwd.pdf");

    const res = await worker.fetch("/upload/edge-test", {
      method: "POST",
      body: form,
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.file.sanitizedName, "passwd.pdf");
    assert.ok(!body.file.sanitizedName.includes(".."));
    assert.ok(!body.file.sanitizedName.includes("/"));
  });

  test("11. Worker database adaptation: model compilation safety, validation, and URI sanitization (Migration Phase 5)", async () => {
    const res = await worker.fetch("/db/edge-test");
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.phase5.serverlessOptionsValid, true);
    assert.equal(body.phase5.credentialsRedactionVerified, true);
    assert.equal(body.phase5.recompilationSafe, true);
    assert.equal(body.phase5.modelValidationInWorkerd, true);
    assert.equal(body.models.userModelCompiled, true);
    assert.equal(body.models.userRecompilationProtected, true);
    assert.equal(body.models.validationRulesPassed.validDocument, true);
    assert.equal(body.models.validationRulesPassed.defaultRoleAssigned, true);
    assert.equal(body.models.validationRulesPassed.invalidRoleRejected, true);
    assert.equal(body.sanitization.leakDetected, false);
    assert.ok(body.sanitization.sanitizedOutput.includes("[REDACTED_CREDENTIALS]"));
    assert.ok(!body.sanitization.sanitizedOutput.includes("SuperSecretPassword123!"));
  });
});
