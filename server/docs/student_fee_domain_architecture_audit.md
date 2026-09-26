# Student Fee Domain & Ledger Architecture Audit (Stage 4A)

**Status:** ARCHITECTURE DESIGN AUDIT COMPLETE — STRICT READ-ONLY  
**Date:** 2026-09-27  
**Database Modification:** **CONFIRMED ZERO DATABASE WRITES**  
**Test Suite Verification:** **155/155 Tests Passing**  
**Role:** Lead Backend Architect + ERP Financial Domain Engineer  

---

## A. Executive Summary

This architecture audit establishes the definitive domain model for student fee accounting, transaction processing, and receipt generation across the multi-tenant EduMatrix Virtual Classroom ERP.

### Key Conclusions:
1. **Separation of Pricing vs. Obligation**: `FeeStructure` defines institutional pricing rules (the catalog tariff), but **does not** represent a student's personal financial ledger. A dedicated entity—`StudentFeeAccount`—must bridge the student and the fee structure.
2. **Current `FeesModel` Limitations**: `FeesModel` currently serves only as an ephemeral checkout attempt tracking record. Each user click creates an orphaned row with `status: "unpaid"`. It has no `institutionId`, lacks timestamps, does not track balances, and cannot prevent double payments.
3. **Hardcoded ₹2,000 Admin Fee Anti-Pattern**: The current ₹2,000 additional charge is hardcoded directly in `paymentController.js`. It must be promoted into a configurable institutional fee component within the data model.
4. **Strict Multi-Tenancy**: All financial entities (`FeeStructure`, `StudentFeeAccount`, `PaymentTransaction`, `PaymentReceipt`) must contain a direct, indexed `institutionId`. No financial query may rely solely on traversal through student references.
5. **No Institution Heuristics**: EduMatrix is strictly multi-tenant. The 20 legacy students without `institutionId` remain safely blocked from fee calculation and payment until explicitly assigned by an administrator.

---

## B. Current Financial Architecture

```
[Institutional Level]           [Student Profile Layer]
   Institution                      Student
        │                              │ (institutionId, branch, rollNo)
        ├── FeeStructure (Active)      │
        │   (tuitionFee, currency)     │
        │                              │
        └──────────────────────────────┼────────────────────────┐
                                       ▼                        │
                         [Ephemeral Payment Attempt]            │
                                  FeesModel                     │
                           (amount, year, status)               │
                                       │                        │
                                       ▼                        ▼
                               [Stripe Gateway]     [Unconnected Legacy DB]
                               Checkout Session          registrarfees
                                                        (506 flat records)
```

### Architectural Deficits in Current System:
1. **Missing Ledger**: There is no persistent account tracking total assessed fees, payments made, or outstanding balances.
2. **No Direct Tenant Boundary on Payments**: `FeesModel` does not have `institutionId`.
3. **No Immutable Receipts**: Upon successful payment, the system only marks `FeesModel.status = 'paid'`. No permanent, tamper-proof payment receipt is stored.
4. **Frontend Inconsistency**: `Payfees.jsx` calculates display fees from a local dictionary (`const FEES = { cse: 150000, ... }`) rather than asking the server for an authoritative fee quote.

---

## C. Current Payment Flow Trace

| Step | Operation | Component / File | Authoritative Source / Behavior |
| :--- | :--- | :--- | :--- |
| **1. Identity** | Student Login & Auth | `authStudent` middleware | Reads JWT token; sets `req.studentId`. |
| **2. Profile** | Load Student Details | `POST /api/v5/student-byid` | Loads `name`, `rollNo`, `branch`, `email`. |
| **3. UI Display**| Client-Side Estimate | `Payfees.jsx` | **Non-authoritative**: reads `FEES[student.branch]`. |
| **4. Selection**| Select Academic Year | `Payfees.jsx` dropdown | Student manually picks `year` (1, 2, 3, or 4). |
| **5. Initiation**| Start Payment | `POST /api/v10/payfees` | Payload: `{ year }`. Validates `student.institutionId`. |
| **6. Calculation**| Tariff Resolution | `feeStructureService.js` | Authoritatively fetches `FeeStructure.tuitionFee`. |
| **7. Pre-persist**| Record Checkout Intent| `paymentController.js` | Saves `FeesModel` with `status: 'unpaid'`. |
| **8. Gateway** | Create Stripe Session | Stripe SDK | Line items: `tuitionFee` + **₹2,000 hardcoded fee**. |
| **9. Redirect** | Handshake | Browser to Stripe | Redirects to `session.url`. |
| **10. Verify** | Payment Verification | `POST /api/v10/payment/verify` | Validates `paymentId`, `sessionId`, and Stripe status. |
| **11. Post-persist**| Mark Status | `paymentController.js` | Updates `FeesModel.status = 'paid'`. |
| **12. Failure** | Abandoned / Cancelled | `paymentController.js` | Cancelled deletes record; abandoned leaves it unpaid. |

### Edge Case Analysis:
- **Multiple Clicks**: Clicking "Proceed to payment" 5 times creates 5 distinct `FeesModel` records with identical amounts and `status: "unpaid"`.
- **Partial Payments**: Impossible in current code. Stripe session amount is strictly full tuition + ₹2,000.
- **Duplicate Payments**: If a student pays Year 1, nothing in `FeesModel` prevents them from starting another Year 1 checkout session.
- **Refunds**: Not represented in `FeesModel`.

---

## D. Existing Financial Models Inventory

### 1. `FeeStructure` (`server/models/feeStructureModel.js`)
- **Fields**: `institutionId`, `branch`, `academicYear`, `tuitionFee`, `currency`, `isActive`, `timestamps`.
- **Index**: Unique compound on `(institutionId, branch, academicYear)`.
- **Verdict**: **Preserve**. Represents institutional pricing rules.

### 2. `FeesModel` (`server/models/feesModel.js`)
- **Fields**: `studentId`, `email`, `rollno`, `amount`, `status` ('paid'|'unpaid'), `year`, `stripeSessionId`.
- **Missing**: `institutionId`, `feeStructureId`, `currency`, `timestamps`, line items, balance tracking.
- **Verdict**: **Conflated**. Acts as a transient Stripe attempt record. Should be evolved into `PaymentTransaction`.

### 3. `RegistrarFees` (`server/models/registrarFees.js`)
- **Fields**: `RollNumber`, `Name`, `Fees`, `Fees_status`, `Branch`.
- **Missing**: `institutionId`, `studentId`, `academicYear`, `timestamps`, payment gateway IDs.
- **Verdict**: **Legacy Test Artifact**. 506 flat records completely disconnected from production authentication and payments. Retain as archival only.

---

## E. StudentFeeAccount Design (The Missing Ledger)

The `StudentFeeAccount` represents the **authoritative financial ledger for a specific student for a specific academic year at an institution**.

### Proposed Schema Definition:

```javascript
const studentFeeAccountSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institution",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
      index: true,
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feestructure",
      required: true,
    },
    academicYear: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    // Itemized fee components
    components: [
      {
        code: { type: String, required: true }, // e.g., 'TUITION', 'ADMIN_LAB', 'LIBRARY'
        name: { type: String, required: true }, // e.g., 'Tuition & Instruction'
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    totalAssessed: {
      type: Number,
      required: true,
      min: 0,
    },
    // Institutional waivers, merit discounts, concessions
    concessions: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    netAssessed: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "overdue"],
      default: "unpaid",
      index: true,
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Natural compound uniqueness: One account per student per academic year at an institution
studentFeeAccountSchema.index(
  { institutionId: 1, studentId: 1, academicYear: 1 },
  { unique: true }
);
```

---

## F. Fee Component & Line Item Analysis

Tuition is rarely a single monolithic block in academic institutions. The architecture must model fee breakdown cleanly:
1. **Core Tuition**: Instructional costs, faculty hours.
2. **Administrative & Laboratory Fees**: IT infrastructure, virtual classroom servers, AI compute labs, science laboratories.
3. **Library & Examination Fees**: Evaluation, repository access, degree auditing.

### Architectural Treatment:
- `FeeStructure` must allow declaring these components.
- `StudentFeeAccount` instantiates the breakdown for the student.
- `PaymentReceipt` snapshots the line items permanently.

---

## G. The ₹2,000 Admin Fee Analysis

### Current Implementation:
Found in `server/controllers/paymentController.js` lines 122–132:
```javascript
{
  price_data: {
    currency: feeStructure.currency || "inr",
    product_data: {
      name: "Additional fees",
      description: "Additional administrative & lab fees",
    },
    unit_amount: 2000 * 100,
  },
  quantity: 1,
}
```

### Architectural Findings:
1. **Source**: Currently hardcoded directly in the Stripe line items array.
2. **Institution Scope**: Forced globally on every college without configuration.
3. **Academic Year Scope**: Applied uniformly across Years 1–4.
4. **Receipt Omission**: Because `FeesModel.amount` only stores `feeStructure.tuitionFee` (₹150,000), the database is currently blind to the extra ₹2,000 collected by Stripe!

### Resolution Strategy:
- **Do not hardcode amounts in controllers**.
- Promote the additional fee into `FeeStructure` as a first-class field:
  `additionalFee: { type: Number, default: 0, min: 0 }` (or component array).
- In `StudentFeeAccount`: `totalAssessed = tuitionFee + additionalFee`.
- In `PaymentReceipt`: Itemize both Tuition (₹150,000) and Additional Fees (₹2,000) so accounting balances match gateway settlements to the penny.

---

## H. PaymentTransaction Design

`PaymentTransaction` records an immutable gateway event (Stripe session).

```javascript
const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true, // e.g., "TXN-20260927-ABC1234"
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institution",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
      index: true,
    },
    feeAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentFeeAccount",
      required: true,
      index: true,
    },
    academicYear: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    paymentGateway: {
      type: String,
      enum: ["stripe"],
      default: "stripe",
    },
    providerSessionId: {
      type: String,
      required: true,
      index: true,
    },
    providerPaymentIntentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["initiated", "completed", "failed", "cancelled"],
      default: "initiated",
      index: true,
    },
    initiatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
```

### Mutability Matrix:

| Field Category | Fields | Authority / Rule |
| :--- | :--- | :--- |
| **Immutable upon creation** | `transactionId`, `institutionId`, `studentId`, `feeAccountId`, `amount`, `currency` | Server-determined. Client cannot alter. |
| **Gateway/Server Controlled** | `status`, `providerSessionId`, `providerPaymentIntentId`, `completedAt` | Transitions only via Stripe callback or verified session check. |
| **Client Controlled** | **NONE** | Client has zero authority over transaction state. |

---

## I. PaymentReceipt Design

A receipt is a **permanent, immutable legal record**. It must be completely self-contained via point-in-time snapshots.

```javascript
const paymentReceiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // e.g. "REC-INST77777-2026-00042"
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institution",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paymentTransaction",
      required: true,
      unique: true,
    },
    // Immutable point-in-time snapshot of Institution
    institutionSnapshot: {
      name: { type: String, required: true },
      centerCode: { type: Number, required: true },
    },
    // Immutable point-in-time snapshot of Student
    studentSnapshot: {
      name: { type: String, required: true },
      rollNo: { type: String, required: true },
      branch: { type: String, required: true },
      batch: { type: String, required: true },
      email: { type: String, required: true },
    },
    academicYear: {
      type: Number,
      required: true,
    },
    lineItems: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    totalAmountPaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      default: "Stripe Online Gateway",
    },
    paidAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);
```

---

## J. Multi-Tenant Financial Boundaries

| Entity | Direct `institutionId`? | Reason for Direct Storage |
| :--- | :---: | :--- |
| **`FeeStructure`** | **YES** | Defines tariff strictly within one college. |
| **`StudentFeeAccount`** | **YES** | Mandatory. Prevents financial queries from leaking across colleges. |
| **`PaymentTransaction`**| **YES** | Mandatory. Direct auditing for finance administrators. |
| **`PaymentReceipt`** | **YES** | Mandatory. Legal ownership by institution. |

**Defense-in-Depth Authorization Rule:**
Every financial controller must verify:
```javascript
if (record.institutionId.toString() !== req.institutionId.toString()) {
  return res.status(403).json({ success: false, message: "Forbidden: Cross-tenant financial access" });
}
```

---

## K. Complete Financial Data Relationships

```
                     ┌───────────────────────────┐
                     │        Institution        │
                     └─────────────┬─────────────┘
                                   │
         ┌─────────────────────────┴────────────────────────┐
         ▼ 1:N                                              ▼ 1:N
┌──────────────────┐                              ┌───────────────────┐
│   FeeStructure   │                              │      Student      │
└────────┬─────────┘                              └─────────┬─────────┘
         │                                                  │
         │ 1:N                                              │ 1:N
         ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          StudentFeeAccount                          │
│        Unique Index: (institutionId, studentId, academicYear)       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ 1:N
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PaymentTransaction                          │
│               Unique Index: (transactionId), (providerSessionId)    │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ 1:1
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           PaymentReceipt                            │
│               Unique Index: (receiptNumber), (transactionId)        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## L. Uniqueness & Indexing Rules

1. **`StudentFeeAccount` Uniqueness**:
   `{ institutionId: 1, studentId: 1, academicYear: 1 }` (Unique)
   - *Why*: A student cannot have two distinct billing obligations for Year 2 at College A.
   - *Transfer/Re-admission*: If a student transfers to College B, `institutionId` changes, creating a clean separate account.
2. **`PaymentTransaction` Uniqueness**:
   - `{ transactionId: 1 }` (Unique internal reference)
   - `{ providerSessionId: 1 }` (Unique Stripe session)
   - `{ institutionId: 1, studentId: 1, createdAt: -1 }` (Compound index for student history)
3. **`PaymentReceipt` Uniqueness**:
   - `{ receiptNumber: 1 }` (Unique legal identifier)
   - `{ transactionId: 1 }` (1:1 mapping with transaction)

---

## M. Accounting Invariants

1. **Non-Negativity**: `totalAssessed >= 0`, `netAssessed >= 0`, `totalPaid >= 0`, `outstandingBalance >= 0`.
2. **Balance Formula**: `outstandingBalance = netAssessed - totalPaid`.
3. **Single Fulfillment**: A successful Stripe checkout completes exactly one `PaymentTransaction` and issues exactly one `PaymentReceipt`.
4. **Idempotent Ledger Updates**: Repeated verification calls with the same Stripe session cannot increment `totalPaid` multiple times.
5. **No Phantom Revenue**: Failed or abandoned Stripe sessions must never increment `totalPaid` or generate receipts.
6. **Cross-Tenant Lockdown**: A student or administrator can never view, verify, or pay an account belonging to a different `institutionId`.

---

## N. Legacy Data Migration Considerations

| Data Segment | Record Count | Migration Classification | Action Plan |
| :--- | :---: | :--- | :--- |
| **Students with `institutionId`** (Preserved) | 3 | **Ready for Account Provisioning** | Can receive `StudentFeeAccount` as soon as canonical `FeeStructure` is seeded. |
| **Legacy Students without `institutionId`** | 20 | **STRICTLY BLOCKED** | Cannot be assigned fee accounts or pay fees until administrator completes manual institution mapping. |
| **Existing `FeesModel` rows** | 16 | **Archival / Test Attempts** | All 16 belong to student `Himanshu Dinkar`; all are `unpaid`. Safe to archive without financial reconciliation. |
| **`registrarfees` records** | 506 | **Archival Only** | Unauthenticated test records. Do not attempt automated reconciliation. |

---

## O. `FeesModel` Disposition Strategy

To maintain complete backward compatibility with working tests and payment flows:
1. **Phase 1 (Immediate)**: Retain `FeesModel` as the underlying Mongoose model, but add `institutionId`, `currency`, and `feeStructureId` fields.
2. **Phase 2**: Introduce `PaymentReceipt` schema.
3. **Phase 3**: Introduce `StudentFeeAccount` to manage obligations.
4. **Phase 4**: Alias or migrate `FeesModel` to `PaymentTransaction`.
*This phased evolution avoids breaking `tests/payment.test.js` while achieving clean architectural separation.*

---

## P. Recommended Implementation Sequence

```
Stage 4B: Configurable Fee Component in FeeStructure
  • Add additionalFee (or components) to FeeStructure model and service.
  • Replace hardcoded 2000 in paymentController with structure.additionalFee.

Stage 4C: Server-Authoritative Fee Quote API
  • Implement GET /api/v10/fees/quote?year=X.
  • Update Payfees.jsx to fetch live quote; delete hardcoded FEES dictionary.

Stage 4D: Multi-Tenant Payment Hardening & Receipt Model
  • Add direct institutionId, currency, and timestamps to FeesModel.
  • Create PaymentReceipt schema.
  • Instantiate PaymentReceipt upon successful verifyPayment.

Stage 4E: Payment History & Receipt Download API
  • Implement GET /api/v10/payment/receipts.
  • Implement GET /api/v10/payment/receipt/:id.
  • Build receipt modal in Student Dashboard.

Stage 4F: StudentFeeAccount / Ledger Layer
  • Create StudentFeeAccount schema.
  • Hook verifyPayment to increment account.totalPaid and decrement balance.
```

---

## Q. Risks & Open Questions

1. **Stripe Session Expiry**: Abandoned checkout sessions remain in Stripe for 24 hours. The server should mark `PaymentTransaction.status = 'cancelled'` if unverified after expiry.
2. **Academic Year Progression**: In future phases, the registrar should formally advance a student's `currentAcademicYear` so students do not pick from a raw dropdown.
3. **Currency Support**: The system defaults to `"INR"`. The schema accommodates multi-currency for international institutions.

---

## R. Database Safety & Zero-Write Verification

Before and after counts were compared via read-only queries:

| Metric | Baseline Count | Post-Audit Count | Status |
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

## S. Test Suite Verification

- `tests/legacy_institution_migration.test.js`: **11/11 passed**
- `tests/fee_structure.test.js`: **5/5 passed**
- `tests/payment.test.js`: **19/19 passed**
- **Full Backend Test Suite (`npm test`)**: **155/155 tests passing** across 19 suites.
