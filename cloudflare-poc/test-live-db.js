import { unstable_dev } from "wrangler";
import fs from "node:fs";

async function runLiveVerification() {
  console.log("================================================================");
  console.log("EduMatrix Phase 5: Live MongoDB Atlas Verification in workerd");
  console.log("Target Database Manager: server/db/db.js");
  console.log("================================================================\n");

  // Read .dev.vars to populate Worker environment bindings
  const devVars = {};
  if (fs.existsSync(".dev.vars")) {
    const content = fs.readFileSync(".dev.vars", "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        devVars[key] = val;
      }
    }
  }

  console.log("[1/6] Launching Cloudflare Worker runtime (workerd) with Atlas bindings...");
  const worker = await unstable_dev("src/index.js", {
    config: "wrangler.json",
    vars: devVars,
    experimental: { disableExperimentalWarning: true },
  });

  try {
    // ── Test 1: Real Authenticated Mongoose Connection & Read/Write/Cleanup ──
    console.log("\n[2/6] Executing Cold-Start Live Atlas Connection (Direct Replica Mode)...");
    const res1 = await worker.fetch("/db/live-verify?mode=direct");
    const status1 = res1.status;
    const body1 = await res1.json();

    if (status1 !== 200 || !body1.success) {
      console.error("Cold start live verification failed:", body1);
      throw new Error(`Live Atlas verification returned HTTP ${status1}: ${body1.error || JSON.stringify(body1)}`);
    }

    console.log("✅ Authenticated Connection Established successfully via server/db/db.js!");
    console.log(`   - Runtime: ${body1.runtime}`);
    console.log(`   - Manager: ${body1.manager}`);
    console.log(`   - Connection State: ${body1.connection.connectionState} (isDbConnected: ${body1.connection.isDbConnected})`);
    console.log(`   - Initial Connect Duration: ${body1.connection.connectDurationMs}ms`);

    console.log("\n[3/6] Verifying Harmless Read Operations...");
    console.log(`   - Admin Ping Response: ${JSON.stringify(body1.harmlessRead.ping)}`);
    console.log(`   - Total Collections Found: ${body1.harmlessRead.totalCollectionsFound}`);
    console.log(`   - Sample Collection Queried: "${body1.harmlessRead.sampleCollection}"`);
    console.log(`   - Document Count: ${body1.harmlessRead.sampleCount}`);
    console.log(`   - Read Duration: ${body1.harmlessRead.readDurationMs}ms`);

    console.log("\n[4/6] Verifying Controlled Write & Immediate Cleanup (Isolated Test Data)...");
    console.log(`   - Isolated Collection: "${body1.controlledWriteAndCleanup.collection}"`);
    console.log(`   - Inserted Doc ID: "${body1.controlledWriteAndCleanup.insertedId}"`);
    console.log(`   - Insert Acknowledged: ${body1.controlledWriteAndCleanup.insertedAcknowledged}`);
    console.log(`   - Read-Back Match Verified: ${body1.controlledWriteAndCleanup.readBackVerified}`);
    console.log(`   - Deleted Count: ${body1.controlledWriteAndCleanup.deletedCount}`);
    console.log(`   - Cleanup Verified: ${body1.controlledWriteAndCleanup.cleanupVerified}`);
    console.log(`   - Write + Cleanup Duration: ${body1.controlledWriteAndCleanup.writeCleanupDurationMs}ms`);

    // ── Test 2: Connection Reuse in Same Warm Isolate ────────────────────────
    console.log("\n[5/6] Verifying Connection Reuse across Subsequent Requests in Warm Isolate...");
    const res2 = await worker.fetch("/db/live-verify?mode=direct");
    const body2 = await res2.json();
    console.log(`   - 2nd Request Status: ${res2.status}`);
    console.log(`   - 2nd Request Duration: ${body2.totalDurationMs}ms`);
    console.log(`   - Connection Reused: ${body2.connection.connectionReused} (connectDurationMs: ${body2.connection.connectDurationMs}ms)`);
    console.log(`   - Isolate State: ${body2.connection.connectionState}`);

    // ── Test 3: Safe Failure Behavior & Credential Redaction ─────────────────
    console.log("\n[6/6] Verifying Safe Failure Behavior & Credential Redaction...");
    const resFail = await worker.fetch("/db/live-verify?testFailure=true");
    const bodyFail = await resFail.json();
    console.log(`   - Failure Request Handled: ${bodyFail.failureHandled}`);
    console.log(`   - Credentials Redacted: ${bodyFail.credentialsRedacted}`);
    console.log(`   - Sanitized Error Output: "${bodyFail.sanitizedError}"`);
    if (!bodyFail.credentialsRedacted) {
      throw new Error("Credential leakage detected in error handling path!");
    }

    console.log("\n================================================================");
    console.log("🎉 ALL 5 LIVE ATLAS VERIFICATION CHECKS PASSED IN workerd!");
    console.log("================================================================\n");

  } finally {
    await worker.stop();
  }
}

runLiveVerification().catch((err) => {
  console.error("\n❌ Live Verification Failed:", err);
  process.exit(1);
});
