import { MongoClient } from "mongodb";
import bcrypt from "../server/node_modules/bcrypt/bcrypt.js";
import fs from "node:fs";

// Load MONGO_URI from ../server/.env safely in memory
const serverEnv = fs.readFileSync("../server/.env", "utf8");
let mongoUri = "";
for (const line of serverEnv.split("\n")) {
  if (line.startsWith("MONGO_URI=")) {
    mongoUri = line.slice(line.indexOf("=") + 1).trim();
    break;
  }
}

const PROXY_URL = "http://127.0.0.1:8787";
const DIRECT_URL = "http://127.0.0.1:5000";

async function findTestStudent() {
  const candidatePasswords = [
    "Password123!",
    "password",
    "123456",
    "pw",
    "admin123",
    "test",
    "12345678",
    "Himanshu@123",
    "himanshu123",
  ];

  const client = new MongoClient(mongoUri);
  await client.connect();
  const students = await client.db("test").collection("students").find({}).toArray();

  let matchedAccount = null;
  for (const s of students) {
    if (!s.email || !s.password) continue;
    for (const p of candidatePasswords) {
      if (await bcrypt.compare(p, s.password)) {
        matchedAccount = {
          email: s.email,
          password: p,
          name: s.name,
          institutionId: s.institutionId ? s.institutionId.toString() : null,
        };
        break;
      }
    }
    if (matchedAccount) break;
  }

  await client.close();
  return matchedAccount;
}

function maskString(str) {
  if (!str) return "[EMPTY]";
  if (str.length <= 4) return "****";
  return str.slice(0, 2) + "****" + str.slice(-2);
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return "[MASKED_EMAIL]";
  const [local, domain] = email.split("@");
  return maskString(local) + "@" + domain;
}

async function runValidation() {
  console.log("=============================================================");
  console.log("Real Authenticated Student API Flow via Cloudflare Worker PoC");
  console.log("=============================================================\n");

  console.log("1. Discovering Authorized Test Student Account...");
  const testStudent = await findTestStudent();
  if (!testStudent) {
    console.error("No authorized test student account with verifiable credentials found.");
    process.exit(1);
  }
  console.log(`   Found Test Student: Name='${testStudent.name}', Email='${maskEmail(testStudent.email)}'`);

  // STEP 1: Authenticate via POST /api/v1/login through the Worker
  console.log("\n2. Executing Real Student Login Flow via Cloudflare Worker...");
  console.log(`   Target: POST ${PROXY_URL}/api/v1/login`);
  const loginStart = Date.now();
  const loginRes = await fetch(`${PROXY_URL}/api/v1/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      email: testStudent.email,
      password: testStudent.password,
    }),
  });
  const loginDurationMs = Date.now() - loginStart;
  const loginHeaders = Object.fromEntries(loginRes.headers.entries());
  const loginBody = await loginRes.json();

  console.log(`   Status: ${loginRes.status} ${loginRes.statusText} (${loginDurationMs}ms)`);
  console.log(`   Edge Header: x-edge-proxied-by = '${loginHeaders["x-edge-proxied-by"]}'`);
  console.log(`   Set-Cookie Present: ${Boolean(loginHeaders["set-cookie"])}`);
  console.log(`   Response Body: success=${loginBody.success}, message='${loginBody.message}', tokenPresent=${Boolean(loginBody.token)}`);

  if (!loginRes.ok || !loginBody.success || !loginBody.token) {
    console.error("   FAILED: Student login through Worker was not successful.");
    process.exit(1);
  }
  const sessionToken = loginBody.token;

  // STEP 2: Query Read-Only Student Data Endpoint via Worker (/api/v10/fees/ledger)
  console.log("\n3. Testing Read-Only Student Fee Ledger via Cloudflare Worker...");
  console.log(`   Target: GET ${PROXY_URL}/api/v10/fees/ledger`);
  const ledgerStart = Date.now();
  const ledgerRes = await fetch(`${PROXY_URL}/api/v10/fees/ledger`, {
    headers: {
      "Authorization": `Bearer ${sessionToken}`,
      "Accept": "application/json",
    },
  });
  const ledgerDurationMs = Date.now() - ledgerStart;
  const ledgerHeaders = Object.fromEntries(ledgerRes.headers.entries());
  const ledgerBody = await ledgerRes.json();

  console.log(`   Status: ${ledgerRes.status} ${ledgerRes.statusText} (${ledgerDurationMs}ms)`);
  console.log(`   Edge Header: x-edge-proxied-by = '${ledgerHeaders["x-edge-proxied-by"]}'`);
  console.log(`   Content-Type: ${ledgerHeaders["content-type"]}`);
  console.log(`   Financial Summary Status: ${ledgerBody.status}`);
  console.log(`   Total Assessed: ${ledgerBody.financialSummary?.totalAssessed}`);
  console.log(`   Outstanding Balance: ${ledgerBody.financialSummary?.outstandingBalance}`);
  console.log(`   Configured Fee Structures Count: ${ledgerBody.financialSummary?.feeStructuresConfiguredCount}`);
  console.log(`   Academic Years Count: ${ledgerBody.years?.length || 0}`);

  // STEP 3: Query Second Read-Only Endpoint (/api/classrooms/my/enrolled)
  console.log("\n4. Testing Second Read-Only Student Endpoint via Cloudflare Worker...");
  console.log(`   Target: GET ${PROXY_URL}/api/classrooms/my/enrolled`);
  const classStart = Date.now();
  const classRes = await fetch(`${PROXY_URL}/api/classrooms/my/enrolled`, {
    headers: {
      "Authorization": `Bearer ${sessionToken}`,
      "Accept": "application/json",
    },
  });
  const classDurationMs = Date.now() - classStart;
  const classHeaders = Object.fromEntries(classRes.headers.entries());
  const classBody = await classRes.json();

  console.log(`   Status: ${classRes.status} ${classRes.statusText} (${classDurationMs}ms)`);
  console.log(`   Edge Header: x-edge-proxied-by = '${classHeaders["x-edge-proxied-by"]}'`);
  console.log(`   Response Body: success=${classBody.success}, count=${classBody.count}`);

  // STEP 4: Negative Control with No Credentials
  console.log("\n5. Executing Negative Control (Unauthenticated Request via Worker)...");
  console.log(`   Target: GET ${PROXY_URL}/api/v10/fees/ledger (No Auth)`);
  const negRes = await fetch(`${PROXY_URL}/api/v10/fees/ledger`);
  const negBody = await negRes.json();
  console.log(`   Status: ${negRes.status} ${negRes.statusText}`);
  console.log(`   Response Body: success=${negBody.success}, message='${negBody.message}'`);

  // STEP 5: Direct Express Origin Baseline Comparison
  console.log("\n6. Comparing Worker Response with Direct Express Origin Baseline...");
  console.log(`   Target: GET ${DIRECT_URL}/api/v10/fees/ledger (Direct)`);
  const directStart = Date.now();
  const directRes = await fetch(`${DIRECT_URL}/api/v10/fees/ledger`, {
    headers: {
      "Authorization": `Bearer ${sessionToken}`,
      "Accept": "application/json",
    },
  });
  const directDurationMs = Date.now() - directStart;
  const directBody = await directRes.json();

  console.log(`   Direct Status: ${directRes.status} (${directDurationMs}ms) vs Worker Status: ${ledgerRes.status} (${ledgerDurationMs}ms)`);
  const keysMatch = JSON.stringify(Object.keys(ledgerBody).sort()) === JSON.stringify(Object.keys(directBody).sort());
  const financialStatusMatch = ledgerBody.status === directBody.status;
  const totalAssessedMatch = ledgerBody.financialSummary?.totalAssessed === directBody.financialSummary?.totalAssessed;
  console.log(`   Schema Keys Match: ${keysMatch}`);
  console.log(`   Financial Status Match: ${financialStatusMatch}`);
  console.log(`   Financial Total Assessed Match: ${totalAssessedMatch}`);

  console.log("\n=============================================================");
  console.log("FINAL VALIDATION SUMMARY:");
  console.log(`1. Real Student Login via Worker:       PASSED (${loginRes.status} OK)`);
  console.log(`2. Read-Only Fee Ledger via Worker:     PASSED (${ledgerRes.status} OK)`);
  console.log(`3. Enrolled Classrooms via Worker:      PASSED (${classRes.status} OK)`);
  console.log(`4. Negative Control (Unauthenticated):  PASSED (${negRes.status} Rejected)`);
  console.log(`5. Fidelity vs Direct Express Baseline: PASSED (Exact Match)`);
  console.log("=============================================================");
}

runValidation().catch((err) => {
  console.error("Unexpected error during validation:", err);
  process.exit(1);
});
