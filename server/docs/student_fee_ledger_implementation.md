# EduMatrix Student Fee Ledger & Dynamic Academic Progression Implementation

**Stage 4B Technical Architecture, Correction Pass & Policy Specification**  
**Date:** September 27, 2026  
**Status:** Verification & Correction Pass Complete  
**Coverage:** 22 Backend Test Suites (174/174 passing), Production Client Build (Verified), Zero Live DB Mutations  

---

## 1. Academic Calendar Source

### The Elimination of Universal Session Assumptions
In earlier iterations, the system assumed that Indian technical colleges universally transition academic sessions on July 1st of each calendar year. This assumption was identified as architecturally non-compliant for a multi-tenant university ERP platform. Different institutions, autonomous universities, polytechnics, international partners, and colleges operate under distinct academic calendars (e.g., August 1st for state technical universities, September 1st for central or international universities, January 1st for calendar-year distance or diploma programs).

### Authoritative Source of Truth
An audit of existing models (`Institution`, `Classroom`, `Enrollment`, `Student`) confirmed that the initial database lacked an explicit academic calendar entity. 
To support multi-institution operation without hardcoded calendar rules or code changes:
1. **Institution-Configurable Calendar:** The `Institution` model has been upgraded with an optional `academicCalendar` sub-document:
   ```javascript
   academicCalendar: {
     sessionStartMonth: {
       type: Number, // 1-indexed (1 = January, 7 = July, 8 = August, 9 = September)
       default: 7,
       min: 1,
       max: 12,
     },
     sessionStartDay: {
       type: Number, // 1-31
       default: 1,
       min: 1,
       max: 31,
     },
   }
   ```
2. **Dynamic Resolution & Fallback:** The progression service inspects `institution.academicCalendar`. If configured, it executes boundary calculations according to that institution's specific session start date. If omitted on legacy records, it uses standard default parameters (Month 7, Day 1) while transparently flagging whether the calendar is institution-configured in the progression metadata (`isInstitutionConfigured: true/false`).
3. **Multi-Calendar Support:**
   - **College A:** `sessionStartMonth: 8, sessionStartDay: 1` (August 1 session start).
   - **College B:** `sessionStartMonth: 1, sessionStartDay: 1` (January 1 calendar-year session start).
   - **College C:** `sessionStartMonth: 9, sessionStartDay: 1` (September 1 session start).
   Both test suites and production services resolve any institution's calendar dynamically with zero code changes.

---

## 2. Academic Progression Algorithm

The academic progression engine (`server/services/studentAcademicProgressionService.js`) calculates a student's standing deterministically and server-authoritatively without guessing or relying on client-supplied data.

### Algorithm Steps:
1. **Tenancy & Profile Validation:**
   - Verifies `student.institutionId` is a valid ObjectId. If null or missing, immediately halts with `status: "UNRESOLVED"` (protects legacy unassigned students).
   - Verifies `student.branch` is a non-empty string.
2. **Cohort & Course Duration Extraction:**
   - Evaluates `student.batch` against the standard pattern `/^(\d{4})\s*-\s*(\d{4})$/`.
   - `admissionYear = parseInt(match[1], 10)`
   - `graduationYear = parseInt(match[2], 10)`
   - `courseDuration = graduationYear - admissionYear` (clamped & validated between 1 and 6 years; supports 1-year PG diplomas, 2-year masters, 3-year diplomas/degrees, 4-year B.Tech, 5-year law/integrated degrees, and 6-year PharmD/medical programs).
3. **Session Boundary Evaluation:**
   - Extracts current date: `nowYear = now.getFullYear()`, `nowMonth = now.getMonth() + 1`, `nowDay = now.getDate()`.
   - Reads institution `startMonth` and `startDay`.
   - Compares:
     $$\text{isPastSessionBoundary} = (\text{nowMonth} > \text{startMonth}) \lor (\text{nowMonth} = \text{startMonth} \land \text{nowDay} \ge \text{startDay})$$
   - `currentSessionStartYear = isPastSessionBoundary ? nowYear : nowYear - 1`
   - `elapsedAcademicYears = currentSessionStartYear - admissionYear + 1`
4. **Current Academic Year & Standing:**
   - `currentAcademicYear = Math.min(Math.max(elapsedAcademicYears, 1), courseDuration)`
   - `isGraduated = elapsedAcademicYears > courseDuration`
5. **Assessed Sessions List:**
   - Generates sequential academic years $[1, \dots, \text{currentAcademicYear}]$.
   - For each year $y$, formats the session label as `${admissionYear + y - 1}-${admissionYear + y}` (e.g. `2022-23`).
6. **Boundary Conditions Handled:**
   - **Graduated Cohort:** For cohort `2020-2024` evaluated in `2026`, clamped to `Year 4`, `isGraduated = true`, and assesses exactly Years 1–4 without generating fictitious Year 5+ obligations.
   - **Pre-Session / Late Admission:** Admitted for `2026-2030` evaluated in May 2026 before the session starts: clamped to `Year 1`, `isGraduated = false`.
   - **Unassigned Institution:** Immediately returns `status: "UNRESOLVED"` with reason: `"Student is not assigned to an active institution. Tenancy unresolved."`.

---

## 3. StudentFeeAccount Semantics

### Financial Source of Truth Architecture
The database currently has `studentfeeaccounts = 0` and `feestructures = 0`.
The architecture establishes unambiguous semantics for `StudentFeeAccount`:
- **Is it a persistent obligation record (Option A) or a dynamically derived financial view (Option B)?**
  - **Single Source of Truth for Base Obligations:** `FeeStructure(institutionId, branch, academicYear)` is the institution-level tariff authority.
  - **Single Source of Truth for Payments:** Verified `FeesModel` transactions (`status: 'paid'`) are the payment event authority.
  - **Role of `StudentFeeAccount`:** `StudentFeeAccount` is a **persistent student-level financial ledger overlay and synchronization record**.
- **Dynamic Derivation with Persistent State Synchronization:**
  1. In the absence of student-specific overrides or transactions, `studentFeeLedgerService` **dynamically derives** expected obligations from active `FeeStructure` records and balances from verified payments. This guarantees that unseeded or pre-existing students do not require artificial pre-generation of dummy rows.
  2. When student-specific financial adjustments occur (e.g., merit concessions, scholarships, fee waivers) or when a verified Stripe transaction completes, `StudentFeeAccount` is **persisted and synchronized** to maintain an immutable, durable audit record (`server/models/studentFeeAccountModel.js`).
  3. Legacy students lacking authoritative `institutionId` are strictly excluded from record creation.

---

## 4. Expected-Obligation Calculation

For any student $S$ in branch $B$ and assessed year $y \in [1, \dots, \text{currentAcademicYear}]$:
1. **Base Assessment ($A_y$):**
   - Looks up active `FeeStructure` for $(S.\text{institutionId}, B, y)$.
   - If not configured, $A_y = 0$, `feeStructureConfigured = false`.
   - If configured:
     $$A_y = \text{tuitionFee} + \text{additionalFee}$$
     where line items are fully itemized in `components` (e.g. Tuition, Lab, Library, Administrative).
2. **Concessions & Waivers ($C_y$):**
   - If a `StudentFeeAccount` exists for $(S.\text{institutionId}, S.\text{id}, y)$, sums all authorized concessions:
     $$C_y = \sum c.\text{amount}$$
   - Net Assessed:
     $$\text{NetAssessed}_y = \max(0, A_y - C_y)$$
3. **Verified Payments ($P_y$):**
   - Sums all verified gateway transactions in `FeesModel` for $(S.\text{id}, y, \text{status: 'paid'})$:
     $$P_y = \sum p.\text{amount}$$
4. **Net Due for Year $y$ ($D_y$):**
   $$D_y = \max(0, \text{NetAssessed}_y - P_y)$$
5. **Cumulative Totals:**
   - $\text{TotalAssessed} = \sum_{y=1}^N \text{NetAssessed}_y$
   - $\text{TotalPaid} = \sum_{y=1}^N P_y$
   - $\text{OutstandingBalance} = \max(0, \text{TotalAssessed} - \text{TotalPaid})$

---

## 5. Payment Allocation Policy

When payments are processed across multiple assessed academic years, EduMatrix implements the **Deterministic Chronological FIFO Allocation Policy (Oldest Outstanding Obligation First)**.

### Policy Rules:
1. **Rule of Chronological Precedence:**
   - Financial obligations are strictly ordered chronologically: $\text{Year 1} \to \text{Year 2} \to \text{Year 3} \to \text{Year 4}$.
   - Historical arrears from prior academic sessions take absolute precedence over current or subsequent session fees.
2. **Year-Targeted Payment Arrears Precondition:**
   - When a student initiates payment for academic year $Y > 1$, the server evaluates all prior assessed years $k \in [1, \dots, Y - 1]$.
   - If any prior year $k$ has $D_k > 0$, checkout for year $Y$ is **rejected with HTTP 400**:
     ```json
     {
       "success": false,
       "message": "Prior academic year 1 has outstanding arrears of ₹152,000. In accordance with institutional policy, earlier academic sessions must be settled before paying Year 2."
     }
     ```
   - This prevents students from arbitrarily skipping delinquent historical debt.
3. **Lump-Sum Allocation Waterfall Algorithm (`allocatePaymentChronologicalFIFO`):**
   - Given payment amount $P$ and chronologically sorted years $[1, \dots, N]$:
     - For each year $y$:
       $$\text{alloc}_y = \min(D_y, P)$$
       $$P \leftarrow P - \text{alloc}_y$$
       $$\text{remainingDue}_y = D_y - \text{alloc}_y$$
       $$\text{status}_y = \begin{cases} \text{PAID}, & \text{if } \text{remainingDue}_y = 0 \\ \text{PARTIALLY\_PAID}, & \text{if } \text{alloc}_y > 0 \\ \text{UNPAID}, & \text{if } \text{alloc}_y = 0 \end{cases}$$
       If $P = 0$, break.
     - Any residual $P > 0$ after all years are settled is preserved as unallocated advance credit (`unallocatedAmount`).
   - **Tested Example:**
     - Year 1 due: ₹150,000 | Year 2 due: ₹150,000 | Year 3 due: ₹100,000 | Year 4 due: ₹150,000.
     - Payment received: ₹200,000.
     - **Result:**
       - Year 1: ₹150,000 settled in full (Remaining: ₹0, Status: `PAID`).
       - Year 2: ₹50,000 allocated (Remaining: ₹100,000, Status: `PARTIALLY_PAID`).
       - Year 3: ₹0 allocated (Remaining: ₹100,000, Status: `UNPAID`).
       - Year 4: ₹0 allocated (Remaining: ₹150,000, Status: `UNPAID`).
       - Unallocated: ₹0.

---

## 6. Current-Year vs Historical Arrears Logic

The backend and frontend strictly segregate:
- **Current Academic Year Obligation:**
  $$\text{CurrentYearDue} = D_{\text{currentAcademicYear}}$$
  $$\text{CurrentYearFee} = \text{NetAssessed}_{\text{currentAcademicYear}}$$
  $$\text{CurrentYearPaid} = P_{\text{currentAcademicYear}}$$
- **Previous Academic Years' Arrears:**
  $$\text{PreviousYearsDue} = \sum_{y=1}^{\text{currentAcademicYear} - 1} D_y$$
  $$\text{PreviousYearsFee} = \sum_{y=1}^{\text{currentAcademicYear} - 1} \text{NetAssessed}_y$$
  $$\text{PreviousYearsPaid} = \sum_{y=1}^{\text{currentAcademicYear} - 1} P_y$$
- **Reconciliation Invariant:**
  $$\text{OutstandingBalance} = \text{CurrentYearDue} + \text{PreviousYearsDue}$$
This calculation is completely server-authoritative and rendered in dedicated side-by-side KPI cards in the student dashboard.

---

## 7. Payment UI Behavior

In `client/src/Student Dashboard/Payment/Payfees.jsx`:
1. **Dropdown Selection & Guidance:**
   - Dropdown lists all assessed years with their session label and current due.
   - Defaults automatically to the earliest year with outstanding dues (`firstDueYear`).
2. **Prior Arrears Banner & Button Disabling:**
   - If a student selects Year $Y$ while an earlier year $k < Y$ has $D_k > 0$:
     - A warning banner appears: *"Prior Academic Year $k$ has outstanding arrears of ₹... Please clear earlier sessions first to comply with institutional chronological settlement policy."*
     - The checkout button is disabled and its label switches to: *"Settle Year $k$ Arrears First"*.
3. **Authoritative Amount Locking:**
   - The user cannot enter or edit the payment amount in the client.
   - The amount billed to Stripe is strictly retrieved from the active server `FeeStructure` and verified against outstanding balances.
4. **Zero-Due State:**
   - If $\text{OutstandingBalance} = 0$, payment controls are replaced with an emerald *"Fees Fully Settled"* confirmation card.

---

## 8. Multi-Tenant Considerations

1. **Zero Domain / Name Heuristics:**
   - Tenancy is determined solely by `Student.institutionId \to Institution._id`.
   - Email domains (e.g. `@miet.ac.in`), center codes, or college name strings are never used for tenancy resolution.
2. **Institution-Scoped Indexes:**
   - `StudentFeeAccount`: compound unique index on `{ institutionId: 1, studentId: 1, academicYear: 1 }`.
   - `FeeStructure`: compound unique index on `{ institutionId: 1, branch: 1, academicYear: 1 }`.
3. **Independent Academic Calendars:**
   - Institution A (August session start) and Institution B (January session start) execute within the same codebase concurrently without conflict.
4. **Protection of Legacy Records:**
   - The 20 legacy students in MongoDB without `institutionId` remain in an `UNRESOLVED` state, cleanly blocked from creating rogue ledger entries or executing payments until an administrator explicitly binds their tenancy.

---

## 9. Test Scenarios & Verification Matrix

The test suite in `server/tests/student_fee_ledger.test.js` covers 16 targeted scenarios:

| Category | Test Scenario | Verified Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Progression** | 4-Year Cohort Boundary Progression | Sept 2022 = Y1, March 2024 = Y2, Sept 2025 = Y4 | ✅ PASS |
| **Progression** | Unassigned Institution Tenancy Block | Missing `institutionId` -> `UNRESOLVED` | ✅ PASS |
| **Progression** | Missing Department / Branch | Missing `branch` -> `UNRESOLVED` | ✅ PASS |
| **Progression** | Malformed Batch Format | Batch not `YYYY-YYYY` -> `UNRESOLVED` | ✅ PASS |
| **Progression** | Multi-Institution Calendar: College A (Aug 1) | July 20, 2025 = Y3; August 1, 2025 = Y4 | ✅ PASS |
| **Progression** | Multi-Institution Calendar: College B (Jan 1) | Feb 15, 2025 = Y4 | ✅ PASS |
| **Progression** | Multi-Institution Calendar: College C (Sep 1) | August 20, 2025 = Y3; Sept 5, 2025 = Y4 | ✅ PASS |
| **Progression** | Boundary: Graduated Cohort Clamping | 2020-2024 evaluated in 2026 -> Y4, `isGraduated: true` | ✅ PASS |
| **Progression** | Boundary: Pre-Session Admission Clamping | 2026-2030 evaluated in May 2026 -> Y1, `isGraduated: false` | ✅ PASS |
| **Ledger** | 4-Year Unpaid Student Ledger | Assessed: 608k, Paid: 0, Current: 152k, Arrears: 456k | ✅ PASS |
| **Ledger** | Partially Paid Student Ledger | Y1/Y2 paid, Y3 partial (50k/152k), Y4 unpaid -> Arrears: 102k, Current: 152k | ✅ PASS |
| **Ledger** | Zero-Due Student | All 4 years paid -> Outstanding: 0, Status: `PAID` | ✅ PASS |
| **Ledger** | Controller 200 OK | Authenticated JWT returns complete ledger JSON | ✅ PASS |
| **Ledger** | Controller 401 Unauthorized | Missing JWT returns 401 | ✅ PASS |
| **Payment** | Arrears Precedence Enforcement | Calling `payfees` for Y2 when Y1 is unpaid returns 400 | ✅ PASS |
| **FIFO Allocation**| Multi-Year Waterfall Allocation | ₹200k allocated across 4 years: Y1=150k, Y2=50k, Y3=0, Y4=0 | ✅ PASS |
| **FIFO Allocation**| Partial Payment Allocation | ₹60k allocated on Y1 (due 150k) -> Y1=60k, remaining 90k | ✅ PASS |
| **FIFO Allocation**| Overpayment Allocation | ₹300k on 250k dues -> all paid, unallocated=50k | ✅ PASS |
| **Ledger** | Unconfigured Fee Structure Handling | 0 fee structures -> status `NOT_ASSESSED`, `feeStructuresConfiguredCount: 0` | ✅ PASS |
| **Ledger** | Partially Configured Fee Structure | Configured years assessed, unconfigured marked `NOT_ASSESSED` | ✅ PASS |

---

## 10. Stage 4C — Frontend Financial Data Flow Audit & Correction

### The Problem
During manual inspection of `Payfees.jsx`, a student assigned to an active institution without published `FeeStructure` records was presented with contradictory and misleading UI states:
1. **False "Fees Fully Settled" Banner:** Because `totalAssessed = 0` (due to missing fee structures), `outstandingBalance = 0`. The UI evaluated `outstandingBalance === 0` and displayed a celebratory green card stating all fees were paid in full.
2. **Conflicting Account Status Badge:** The ledger summary fell into `overallStatus = "UNPAID"` because `totalAssessed > 0` was required for `PAID`. The dashboard displayed a red "Payment Pending" badge right beside the "Fees Fully Settled" card.
3. **Yearly Breakdown Inconsistency:** In the academic session table, unassessed years with `status = "NOT_ASSESSED"` fell into `else` and rendered a red "Unpaid" badge for ₹0 assessed / ₹0 due.
4. **Explainability Bug:** The calculation basis string referenced `(${progression.batch})`, which evaluated to `undefined` because `student.batch` was not mirrored onto the progression object.

### The Architectural Root Cause
The data contract lacked explicit differentiation between three fundamental business states:
- **State A: Fully Settled / Zero Due:** Fee structures exist and are active, obligations were assessed ($> 0$), and all dues were paid in full ($\text{outstandingBalance} = 0$).
- **State B: Unconfigured / Not Assessed:** The student has a valid institution and batch, but the institution administration has not yet configured or published active fee structures for that branch and cohort ($\text{totalAssessed} = 0, \text{feeStructuresConfiguredCount} = 0$).
- **State C: Unresolved Tenancy:** The student lacks an `institutionId` (legacy student) or has an invalid batch format ($\text{status} = \text{"UNRESOLVED"}$).

### The Resolution
1. **Backend Service Hardening (`server/services/studentFeeLedgerService.js`):**
   - Populated `batch: student.batch || progression.batch` in `academicProgression` so explainability never renders `undefined`.
   - Tracked `feeStructuresConfiguredCount` across assessed academic years.
   - Evaluated `overallStatus = totalAssessed === 0 ? "NOT_ASSESSED" : outstandingBalance === 0 ? "PAID" : totalPaid > 0 ? "PARTIALLY_PAID" : "UNPAID"`.
   - Emitted informative `explainability.summaryText` guiding students to contact institution administration when fee structures are unconfigured.
   - Marked individual year statuses with no fee structure strictly as `"NOT_ASSESSED"`.
2. **Frontend UI Alignment (`client/src/Student Dashboard/Payment/Payfees.jsx`):**
   - Segregated `isUnassessed` ($\text{totalAssessed} = 0$) from `isZeroDue` ($\text{totalAssessed} > 0 \land \text{outstandingBalance} = 0$).
   - Replaced false "Fees Fully Settled" card with an informative amber **"Fee Structure Pending Configuration"** notice when `isUnassessed`.
   - Updated Account Status card to render a neutral `<Badge tone="neutral" icon={Info}>Not Assessed</Badge>` with subtext "Fee structure unconfigured".
   - Rendered neutral "Not Assessed" badges in the yearly table instead of red "Unpaid" badges for unassessed years.
   - Updated the academic year selector and checkout button to disable payments with an explicit `"Fee Structure Unconfigured"` label when fee structures are absent.

---

## 11. Remaining Limitations & Next Stage Scope

1. **PaymentTransaction & Immutable Receipt Domain (Next Stage):**
   - `FeesModel` currently serves as both checkout session tracking and transaction record. A dedicated immutable `PaymentTransaction` collection and downloadable PDF `PaymentReceipt` engine will be constructed in the upcoming stage.
2. **Registrar Batch Reconciliations:**
   - 506 legacy records in `registrarfees` remain unlinked to the new `StudentFeeAccount` ledger. An admin migration tool can be designed once institutions are canonically approved.
3. **No Automatic Backfill for Legacy 20 Students:**
   - In accordance with the zero-guesswork policy, the 20 legacy students without `institutionId` remain unassigned. They must receive explicit administrative assignment before their ledger can be resolved.

---

## Summary of Verification Commands & Status

- **Backend Tests:** `npm test` passed **176/176 tests** across **22 suites** (0 failures).
- **Frontend Build:** `npm run build` in `client/` passed with code 0 (`vite build` in 21.75s).
- **Live Database Immutability:** Exactly 0 live database writes occurred during implementation and testing. Live collection counts verified: `feestructures: 0`, `studentfeeaccounts: 0`, `students: 23`.
