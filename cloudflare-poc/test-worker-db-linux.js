/**
 * Linux Cloudflare Worker MongoDB Live Verification Runner
 * 
 * Executes an actual Mongoose database connection and read-only query inside workerd.
 * Requires explicit MONGO_STAGING_URI environment variable pointing to a non-production staging database.
 */

import { unstable_dev } from "wrangler";

async function main() {
  console.log("===================================================================");
  console.log("EduMatrix: Linux Cloudflare Worker MongoDB Database Verification");
  console.log("===================================================================\n");

  const stagingUri = process.env.MONGO_STAGING_URI;
  const expectedDbName = process.env.EXPECTED_STAGING_DB_NAME || "edumatrix_staging";

  if (!stagingUri || !stagingUri.trim()) {
    console.error("❌ FAILED PRECONDITION: MONGO_STAGING_URI is not set.");
    console.error("   This test requires an explicit staging MongoDB Atlas URI.");
    console.error("   To execute, configure MONGO_STAGING_URI in GitHub Secrets or environment.\n");
    process.exit(1);
  }

  // Reject accidental production URIs
  const lowerUri = stagingUri.toLowerCase();
  if (lowerUri.includes("prod") || lowerUri.includes("production") || lowerUri.includes("live")) {
    console.error("❌ SECURITY REJECTION: The provided URI matches prohibited production identifiers.");
    console.error("   Only dedicated non-production staging databases are permitted.\n");
    process.exit(1);
  }

  console.log("[1/4] Starting isolated Worker runtime (workerd) with staging bindings...");
  let worker;
  try {
    worker = await unstable_dev("src/db-verify-worker.js", {
      config: "wrangler.json",
      vars: {
        MONGO_STAGING_URI: stagingUri,
        EXPECTED_STAGING_DB_NAME: expectedDbName,
      },
      experimental: { disableExperimentalWarning: true },
    });
    console.log("      Worker runtime started successfully.");

    console.log("\n[2/4] Testing worker health probe...");
    const healthRes = await worker.fetch("/health");
    if (healthRes.status !== 200) {
      throw new Error(`Worker health check failed with HTTP ${healthRes.status}`);
    }
    console.log("      Worker health probe responded 200 OK.");

    console.log("\n[3/4] Executing read-only Mongoose operation via server/db/db.js inside workerd...");
    const verifyRes = await worker.fetch("/verify-db", {
      headers: {
        "X-Worker-Test-Runner": "edumatrix-staging-verify",
      },
    });

    const status = verifyRes.status;
    const body = await verifyRes.json();

    if (status !== 200 || !body.success) {
      console.error(`\n❌ Database operation failed inside workerd with HTTP ${status}:`, body.error || body);
      if (body.sanitizedMessage) {
        console.error("   Details:", body.sanitizedMessage);
      }
      process.exit(1);
    }

    console.log("      Mongoose operation completed successfully inside workerd!");
    console.log(`      - Runtime: ${body.runtime}`);
    console.log(`      - Database Manager: ${body.manager}`);
    console.log(`      - Target Tier: ${body.databaseTarget}`);
    console.log(`      - Database Name: ${body.databaseName}`);
    console.log(`      - Connection State: ${body.connectionState} (isDbConnected: ${body.isDbConnected})`);
    console.log(`      - Ping Command Verified: ${body.pingVerified}`);
    console.log(`      - Quiz Model Query Verified: ${body.quizModelQueryVerified}`);
    console.log(`      - Total Operation Duration: ${body.durationMs}ms`);

    console.log("\n[4/4] Verifying safe failure on missing runner header...");
    const unauthRes = await worker.fetch("/verify-db");
    if (unauthRes.status !== 403) {
      throw new Error(`Expected HTTP 403 for missing test runner header, got ${unauthRes.status}`);
    }
    console.log("      Runner header authorization guard verified (HTTP 403).");

    console.log("\n===================================================================");
    console.log("🎉 SUCCESS: Real Mongoose DB query verified inside Linux workerd!");
    console.log("===================================================================\n");
  } finally {
    if (worker) {
      await worker.stop();
      console.log("Worker instance stopped cleanly.");
    }
  }
}

main().catch((err) => {
  console.error("Unexpected error during verification:", err.message || err);
  process.exit(1);
});
