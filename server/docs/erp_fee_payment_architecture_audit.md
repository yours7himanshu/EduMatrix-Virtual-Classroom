# ERP Architecture → Fee & Payment Resolution Audit (Stage 3E)

**Status:** ARCHITECTURE AUDIT COMPLETE — READ-ONLY  
**Date:** 2026-09-27  
**Database Modification:** **CONFIRMED ZERO DATABASE WRITES**  
**Test Suite Verification:** **155/155 Tests Passing**  

---

## 1. Executive Summary

This architecture audit establishes the definitive, server-authoritative data relationship model for fees, student obligations, payments, and receipts across the EduMatrix Virtual Classroom platform.

Building on the Stage 1 Fee Architecture and Stage 2 Payment Hardening, this audit examines how the financial subsystem integrates with the core ERP relationship graph (`Institution`, `Admin`, `Student`, `Classroom`, `Enrollment`).

### Core Findings & Architectural Gaps:
1. **Missing Financial Ledger Layer**: EduMatrix currently has an authoritative tariff catalog (`FeeStructure`) and an ephemeral payment-attempt record (`FeesModel`), but completely lacks a **Student Fee Obligation / Ledger Account** (`StudentFeeAccount`).
2. **Current `FeesModel` Role Conflation**: `FeesModel` currently serves as an ad-hoc Stripe checkout tracking record. Every click on "Proceed to secure payment" instantiates a new `FeesModel` document with `status: "unpaid"`. It does not record the student's overall billing obligation, outstanding balance, historical payments, or official receipt.
3. **Multi-Tenant Boundary Deficit**: While `FeeStructure` is strictly institution-scoped (`institutionId`), `FeesModel` currently **omits `institutionId`**. It relies solely on `studentId` foreign key traversal, which prevents efficient institution-scoped financial aggregation and exposes cross-tenant risks if queries omit joins.
4. **Disconnected Legacy Registrar Data**: The legacy `registrarfees` collection (506 records) and unauthenticated route (`/api/v8/student-fees-data`) are completely disconnected from both `FeeStructure` and Stripe `FeesModel`.
5. **Client-Side Fee Assumption**: The student UI (`Payfees.jsx`) still maintains a hardcoded frontend fee dictionary (`const FEES = { cse: 150000, ... }`) for display purposes, even though `/api/v10/payfees` determines the actual charge from `FeeStructure`.
6. **Academic Year Authority**: The student's academic year is currently selected by the student via a frontend dropdown rather than derived from an authoritative institutional enrollment context.

---

## 2. Current Fee Architecture & Actual Data Flow

### Current Step-by-Step Flow:

```
[Student Browser]
       │
       │ 1. GET /api/v5/student-byid (Loads name, rollNo, branch, email)
       │    [Client calculates displayed fee via hardcoded dictionary: FEES[branch]]
       │
       │ 2. Student selects year (1-4) in UI dropdown
       │
       │ 3. POST /api/v10/payfees { year } (Header: token)
       ▼
[paymentController.payfees]
       │
       │ 4. authStudent middleware: Verifies JWT, extracts req.studentId
       │ 5. Loads Student document
       │ 6. Validates student.institutionId is non-null
       │ 7. Validates student.branch is non-empty
       │ 8. Validates year is integer 1–4
       │
       │ 9. feeStructureService.getFeeStructure({ institutionId, branch, academicYear })
       ▼
[FeeStructure Collection]
       │
       │ 10. Returns authoritative tuitionFee (e.g. ₹150,000)
       ▼
[paymentController.payfees]
       │
       │ 11. Instantiates FeesModel (status: "unpaid", amount: tuitionFee, year, rollno, email)
       │ 12. Creates Stripe Checkout Session (Tuition + ₹2,000 additional administrative fees)
       │ 13. Persists stripeSessionId onto FeesModel
       │ 14. Returns { url: session.url, paymentId: fee._id }
       ▼
[Stripe Gateway]
       │
       │ 15. Student enters card and completes checkout
       │ 16. Stripe redirects to: /verify?success=true&paymentId=...&session_id=...
       ▼
[Verify.jsx]
       │
       │ 17. POST /api/v10/payment/verify { success, paymentId, sessionId }
       ▼
[paymentController.verifyPayment]
       │
       │ 18. Finds FeesModel by paymentId
       │ 19. Checks fee.studentId === req.studentId
       │ 20. Calls stripe.checkout.sessions.retrieve(sessionId)
       │ 21. Validates session.payment_status === "paid"
       │ 22. Validates client_reference_id & metadata match paymentId
       │ 23. Updates FeesModel: status = "paid"
       │ 24. Returns 200 OK -> Navigates to /StudentDashboard/dashboard
```

### Trace Matrix of Existing Flow Components:

| Step | Layer | Entity / File | Route / API | Key Attributes & Context |
| :--- | :--- | :--- | :--- | :--- |
| **Profile** | Client | `Payfees.jsx` | `POST /api/v5/student-byid` | JWT authenticated; loads `name`, `rollNo`, `branch` |
| **Fee Quote** | Client | `Payfees.jsx` | *None (Hardcoded)* | `const FEES = { cse: 150000, ... }` *(Vulnerability / Out-of-sync risk)* |
| **Tariff** | Server | `feeStructureService.js` | Internal call | Queries `FeeStructure` with `institutionId + branch + academicYear` |
| **Payment Start**| Server | `paymentController.js` | `POST /api/v10/payfees` | Creates `FeesModel` record; creates Stripe Session |
| **Gateway** | External| Stripe Hosted Checkout | Stripe API | Line items: `tuitionFee` + `₹2,000` additional charges |
| **Verify** | Client | `Verify.jsx` | `POST /api/v10/payment/verify` | Passes `paymentId` and `sessionId` |
| **Completion** | Server | `paymentController.js` | `POST /api/v10/payment/verify` | Marks `FeesModel.status = 'paid'` |

---

## 3. The True Fee Ownership Model

To establish a scalable ERP architecture, fee data must be modeled across 4 distinct levels:

```
LEVEL 1: Institution Level
         Institution (Tenant Identity)

LEVEL 2: Academic Configuration Level
         Institution + Program/Branch + Academic Year
         └── FeeStructure (Tariff Rules: tuitionFee, currency, effectiveDates)

LEVEL 3: Student Obligation / Account Level
         Student + Academic Year
         └── StudentFeeAccount (Total Assessed, Concessions, Paid, Balance, Status)

LEVEL 4: Transaction & Audit Level
         StudentFeeAccount + Payment Attempt
         ├── PaymentTransaction (Stripe session, paymentIntent, amount, gateway response)
         └── PaymentReceipt (Immutable legal proof of payment, receiptNumber, timestamps)
```

### Gap Analysis Across Levels:
- **Level 1 (Institution)**: Exists (`Institution` collection).
- **Level 2 (Academic Config)**: Exists (`FeeStructure` collection with compound index `institutionId + branch + academicYear`).
- **Level 3 (Student Obligation)**: **COMPLETELY MISSING**. EduMatrix has no record representing what a student currently owes for a term.
- **Level 4 (Transaction / Receipt)**: **PARTIALLY PRESENT / DEGRADED**. `FeesModel` acts as a partial transaction record, but lacks essential audit fields (`institutionId`, `currency`, `timestamps`, `paymentMethod`), and no formal `Receipt` model exists.

---

## 4. Distinguishing FeeStructure vs. StudentFeeObligation vs. FeesModel

| Concept | Question Answered | Current Model in EduMatrix | Status & Limitations |
| :--- | :--- | :--- | :--- |
| **FeeStructure** | "What is the standard charge for Branch X in Year Y at Institution I?" | `FeeStructure` (`feestructures`) | **Solid**. Correctly scoped to `institutionId + branch + academicYear`. |
| **Student Fee Obligation** | "What does Student S owe for Year Y, what concessions apply, what has been paid, and what is the outstanding balance?" | *None* | **Missing**. No entity maintains student-level ledger state. |
| **Payment Transaction** | "Did this specific payment attempt through Stripe succeed or fail?" | `FeesModel` (`fees`) | **Conflated**. Stores Stripe session and status, but lacks `institutionId`, timestamps, and transaction metadata. |
| **Legacy Registrar Record** | "What did an admin type into the registrar tab?" | `registrarFees` (`registrarfees`) | **Deprecated / Disconnected**. Flat, unauthenticated, non-multi-tenant test records. |

### Why `FeesModel` Cannot Serve as the Student Obligation Entity:
1. **Multiple Attempts Spawn Duplicate Records**: Each time a student navigates to `Payfees.jsx` and clicks "Proceed", a new `FeesModel` row is inserted. In the audited database, student `67e2a1349e092c1be188cce5` has **16 separate `FeesModel` documents** with `status: "unpaid"`.
2. **No Balance Tracking**: `FeesModel` only stores a single `amount` tied to a Stripe checkout session. It cannot reflect partial payments, refunds, late fees, or outstanding balances.
3. **No Idempotency Across Years**: A student who paid Year 1 fees could initiate another Year 1 payment because `FeesModel` does not enforce single-payment fulfillment against an academic obligation.

---

## 5. Academic Context in the EduMatrix Relationship Graph

```
Institution
    │
    ├── Admin (role: Director | Registrar | Teacher, institutionId)
    │
    ├── Classroom (institutionId, teacherId, branch, batch, courseCode)
    │       │
    │       └── Enrollment (classroomId, studentId, status: enrolled | dropped)
    │
    └── Student (institutionId, branch, batch, rollNo, email)
```

### Analysis of Academic Fields:
- **`Student.institutionId`**: **AUTHORITATIVE**. Defines institutional tenancy.
- **`Student.branch`**: **AUTHORITATIVE**. Defines program/department (e.g. `CSE`).
- **`Student.batch`**: **DESCRIPTIVE**. Free-form text representing enrollment cohort (e.g. `"2022-2026"`). It indicates the cohort window, but does **not** specify which semester or academic year the student is currently enrolled in.
- **`Enrollment → Classroom`**: **ACADEMIC ONLY**. Connects students to specific courses/classrooms (e.g. `CS-400 Operating System`). Classrooms belong to an institution, branch, and batch, but they do not define tuition schedules.
- **`academicYear`**: **CURRENTLY STUDENT-SUPPLIED**. The frontend allows students to choose Year 1, 2, 3, or 4 at payment time. 

### Architectural Determination:
In a robust ERP, the applicable `academicYear` for fee assessment should ideally be maintained as an authoritative state on the student's profile or determined by institutional term registration. However, allowing the student to select the academic year for billing (e.g. paying in advance or settling back dues) is safe **only because** the backend verifies that the selected `academicYear` maps to an authoritative `FeeStructure`.

---

## 6. Multi-Tenant Financial Boundaries

Financial records require stricter isolation than instructional records because cross-tenant leakage causes severe legal and compliance liabilities.

### Current Vulnerability:
- `FeeStructure` has `institutionId`.
- `Student` has `institutionId`.
- `FeesModel` **DOES NOT have `institutionId`**.

```
[RISKY CURRENT QUERY PATTERN]
Admin A requests financial metrics -> System queries FeesModel
Since FeesModel lacks institutionId, the query must populate `studentId`,
then inspect `student.institutionId`.
If developer forgets the join/filter, Admin A can view Admin B's revenue!
```

### Mandatory Architecture Rule:
Every financial entity (`StudentFeeAccount`, `PaymentTransaction`, `PaymentReceipt`) **MUST carry an explicit, direct, indexed `institutionId`**.

```javascript
// Enforce direct tenant scoping on every financial record:
paymentSchema.index({ institutionId: 1, studentId: 1 });
paymentSchema.index({ institutionId: 1, createdAt: -1 });
```

---

## 7. Analysis of Architectural Options for Student Fee Management

### Option A: Reuse Existing `FeesModel` as-is
- **Approach**: Keep using `FeesModel` for everything; add more fields onto it.
- **Pros**: Zero initial migration effort.
- **Cons**: Severe architectural debt. Conflates payment attempts with ledger balance. 16 failed Stripe clicks produce 16 "unpaid" fee records. No clean way to calculate outstanding balance or generate official receipts.
- **Verdict**: **REJECTED**.

### Option B: Refactor `FeesModel` into `PaymentTransaction` + Introduce `StudentFeeAccount`
- **Approach**:
  1. Add `institutionId`, `currency`, `feeStructureId`, and `timestamps` to `FeesModel` (or alias it as `PaymentTransaction`).
  2. Create a clean `StudentFeeAccount` entity that tracks `(studentId, academicYear, assessedAmount, paidAmount, balance, status)`.
  3. Create a `PaymentReceipt` entity for immutable completed payment records.
- **Pros**: Preserves 100% of existing Stripe integration and tests while establishing clean ERP ledger separation.
- **Cons**: Requires two new complementary models.
- **Verdict**: **RECOMMENDED**.

### Option C: Complete Rewrite with Dual-Entry Ledger Engine
- **Approach**: Implement a full enterprise debits/credits journal system (`GeneralLedger`, `JournalEntry`, `ChartOfAccounts`).
- **Pros**: Maximum enterprise accounting rigor.
- **Cons**: Extreme over-engineering for EduMatrix at its current scale. Would break existing payment controllers, Stripe session hooks, and existing tests.
- **Verdict**: **REJECTED**.

---

## 8. Recommended Target Architecture

```
                       ┌────────────────────────┐
                       │      Institution       │
                       └───────────┬────────────┘
                                   │
         ┌─────────────────────────┴────────────────────────┐
         ▼                                                  ▼
┌──────────────────┐                              ┌───────────────────┐
│   FeeStructure   │                              │      Student      │
│  (Tariff Rule)   │                              │  (Identity & ERP) │
│                  │                              │                   │
│ • institutionId  │                              │ • institutionId   │
│ • branch         │                              │ • branch          │
│ • academicYear   │                              │ • batch           │
│ • tuitionFee     │                              │ • rollNo          │
│ • currency       │                              │ • email           │
└────────┬─────────┘                              └─────────┬─────────┘
         │                                                  │
         │ applies to                                       │ owns
         ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          StudentFeeAccount                          │
│                          (Student Ledger)                           │
│                                                                     │
│ • institutionId      (Direct Tenant Boundary)                       │
│ • studentId          (Ref: Student)                                 │
│ • academicYear       (1 | 2 | 3 | 4)                                │
│ • feeStructureId     (Ref: FeeStructure)                            │
│ • totalAssessed      (Tuition + mandatory institutional fees)       │
│ • totalPaid          (Cumulative verified payments)                 │
│ • outstandingBalance (totalAssessed - totalPaid)                    │
│ • status             ('pending' | 'partially_paid' | 'paid')        │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                        records transactions
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PaymentTransaction                          │
│              (Hardened FeesModel / Payment Attempt)                 │
│                                                                     │
│ • institutionId       (Direct Tenant Boundary)                      │
│ • studentId           (Ref: Student)                                │
│ • feeAccountId        (Ref: StudentFeeAccount)                      │
│ • feeStructureId      (Ref: FeeStructure)                           │
│ • academicYear        (1 | 2 | 3 | 4)                               │
│ • amount              (Server-Authoritative Payable)                │
│ • currency            (default: "INR")                              │
│ • paymentGateway      ("stripe")                                    │
│ • stripeSessionId     (Stripe Checkout Session ID)                  │
│ • status              ('initiated' | 'completed' | 'failed')        │
│ • timestamps          (createdAt, completedAt)                      │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                         generates on success
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           PaymentReceipt                            │
│                      (Immutable Legal Proof)                        │
│                                                                     │
│ • receiptNumber       (e.g. "REC-2026-77777-00014")                 │
│ • institutionId       (Direct Tenant Boundary)                      │
│ • studentId           (Ref: Student)                                │
│ • transactionId       (Ref: PaymentTransaction)                     │
│ • institutionSnapshot ({ name, centerCode, address })               │
│ • studentSnapshot     ({ name, rollNo, branch, email })             │
│ • academicYear        (1 | 2 | 3 | 4)                               │
│ • lineItems           ([{ name: "Tuition", amount: ... }, ...])     │
│ • totalAmountPaid     (Number)                                      │
│ • currency            ("INR")                                       │
│ • paidAt              (Date)                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Fee Display & Quote Architecture

### The Problem with Current UI:
In `client/src/Student Dashboard/Payment/Payfees.jsx`, line 13:
```javascript
const FEES = { cse: 150000, ece: 140000, me: 130000, ce: 120000, it: 125000 };
```
The client UI calculates what to display using this hardcoded map. If an institution sets tuition for CSE to ₹160,000 in `FeeStructure`, the frontend displays ₹150,000, but Stripe charges ₹160,000, causing customer confusion.

### Proposed Fee Quote Endpoint:
- **Route**: `GET /api/v10/fees/quote?year=X`
- **Controller**: `getFeeQuote(req, res)`
- **Behavior**:
  1. Identifies student via `req.studentId`.
  2. Resolves `student.institutionId` and `student.branch`.
  3. Queries `feeStructureService.getFeeStructure`.
  4. Returns authoritative quote:
     ```json
     {
       "success": true,
       "quote": {
         "institutionId": "6aaadbc1409e39bdb4966780",
         "branch": "CSE",
         "academicYear": 2,
         "tuitionFee": 150000,
         "additionalFee": 2000,
         "totalPayable": 152000,
         "currency": "INR",
         "lineItems": [
           { "label": "Tuition & Instruction", "amount": 150000 },
           { "label": "Additional Administrative & Lab Fees", "amount": 2000 }
         ]
       }
     }
     ```
  5. UI renders directly from `quote`, removing `const FEES` entirely.

---

## 10. Payment Receipt Requirements

To generate a professional, downloadable PDF/print receipt, the following fields must be permanently stored at the moment of payment verification:

1. **Receipt Metadata**:
   - `receiptNumber`: Unique sequential or hash-based ID (e.g. `REC-INST77777-2026-0042`).
   - `paidAt`: ISO timestamp of Stripe confirmation.
2. **Institutional Identity**:
   - `institutionName`: Official name of the college.
   - `centerCode`: Official numeric center code.
3. **Student Profile Snapshot**:
   - `studentName`, `rollNo`, `branch`, `batch`, `email`.
4. **Financial Breakdown**:
   - `academicYear`: e.g. "Year 2 (2026–2027)".
   - `lineItems`: Itemized tuition and additional charges.
   - `totalAmountPaid`: Total in INR.
   - `paymentMethod`: "Stripe Checkout (Card/NetBanking)".
   - `gatewaySessionId`: Stripe checkout session identifier.

---

## 11. Legacy Student Implications

### Current Database State:
- **20 legacy students** have `institutionId: null`.
- **0 legacy students** have classroom enrollments.

### Architectural Impact on Legacy Students:
1. **Fee Calculation Blocked**: Without `institutionId`, `feeStructureService` cannot locate a `FeeStructure`. The payment controller strictly returns `400 Bad Request`.
2. **Quote API Blocked**: The proposed `GET /api/v10/fees/quote` will similarly return `400 Bad Request: Student not assigned to an institution`.
3. **No Automatic Mapping Allowed**: In accordance with the Stage 3A, 3B, and 3C audits, email domains (`@miet.ac.in`), branches, and roll numbers must **never** be used to guess fee structures.
4. **Resolution Prerequisite**:
   - Step 1: System Administrator provisions the canonical Institution record.
   - Step 2: Administrator reviews and approves the legacy student assignment manifest.
   - Step 3: Migration script links `Student.institutionId`.
   - Step 4: Institution Administrator creates the `FeeStructure` for each branch and year.
   - Step 5: Legacy students can now view fee quotes and proceed to payment.

---

## 12. Recommended Minimum Safe Implementation Plan

To avoid disrupting working production infrastructure or rewriting working Stripe code, the implementation should proceed in disciplined stages:

```
┌─────────────────────────────────────────────────────────────┐
│ STAGE 4A: Server-Authoritative Fee Quote API                │
│ • Add GET /api/v10/fees/quote endpoint                      │
│ • Unit test quote generation with active FeeStructure       │
│ • Leaves payment controller and Stripe untouched            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 4B: Client Payfees.jsx Alignment                      │
│ • Update Payfees.jsx to call /api/v10/fees/quote            │
│ • Remove hardcoded const FEES dictionary                    │
│ • Render live server amounts and breakdowns                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 4C: Payment Multi-Tenant Hardening & Receipt Model    │
│ • Stamp institutionId and currency onto FeesModel           │
│ • Create PaymentReceipt schema                              │
│ • On successful verifyPayment, instantiate PaymentReceipt   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 4D: Student Receipt View & Download                   │
│ • Add GET /api/v10/payment/receipts (Student payment history)│
│ • Add GET /api/v10/payment/receipt/:id                      │
│ • Build clean printable receipt modal in Student Dashboard  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGE 4E: Student Fee Account / Ledger Layer (Future Scale) │
│ • Introduce StudentFeeAccount for outstanding balance & term │
│ • Support partial payments, waivers, and admin reconciliation│
└─────────────────────────────────────────────────────────────┘
```

---

## 13. What Should NOT Be Changed

1. **Do NOT change the Stripe checkout integration pattern**:
   - `stripe.checkout.sessions.create` with `client_reference_id` and metadata verification in `verifyPayment` is working, secure, and fully verified by unit tests.
2. **Do NOT allow client-supplied amounts**:
   - Keep the Stage 2 server-authoritative fee lookup strictly intact.
3. **Do NOT relax the `student.institutionId` check**:
   - Unaffiliated legacy students must remain blocked from payment until officially assigned.
4. **Do NOT delete `registrarfees` legacy collection prematurely**:
   - Leave `registrarfees` intact as an archival record until historical data is formally reconciled.

---

## 14. Database Safety & Zero-Write Verification

The audit executed strictly read-only queries. Database counts before and after the audit were verified:

| Metric | Baseline Count (Before) | Post-Audit Count (After) | Status |
| :--- | :---: | :---: | :---: |
| **Institutions** | 6 | 6 | **MATCH (Unchanged)** |
| **Students (Total)** | 23 | 23 | **MATCH (Unchanged)** |
| **Students with `institutionId`** | 3 | 3 | **MATCH (Unchanged)** |
| **Students without `institutionId`** | 20 | 20 | **MATCH (Unchanged)** |
| **Admins** | 200 | 200 | **MATCH (Unchanged)** |
| **Classrooms** | 3 | 3 | **MATCH (Unchanged)** |
| **Enrollments** | 6 | 6 | **MATCH (Unchanged)** |
| **FeeStructures** | 0 | 0 | **MATCH (Unchanged)** |
| **FeesModel records** | 16 | 16 | **MATCH (Unchanged)** |
| **RegistrarFees records** | 506 | 506 | **MATCH (Unchanged)** |

**Zero database writes occurred.**

---

## 15. Test Suite Verification

All relevant test suites passed with zero failures:
- `tests/legacy_institution_migration.test.js`: **11/11 passed**
- `tests/fee_structure.test.js`: **5/5 passed**
- `tests/payment.test.js`: **19/19 passed**
- **Full Backend Test Suite (`npm test`)**: **155/155 tests passing** across 19 suites.
