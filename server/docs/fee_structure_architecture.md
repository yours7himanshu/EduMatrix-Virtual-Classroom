# FeeStructure Architecture & Data Model (Stage 1)

## 1. Purpose
The `FeeStructure` model establishes a verified, server-authoritative source of truth for student tuition fees in the EduMatrix platform. Previously, tuition fees were determined by a hardcoded frontend dictionary in `client/src/Student Dashboard/Payment/Payfees.jsx` and sent to `/api/v10/payfees`, which allowed clients to influence the amount billed through the payment gateway.

`FeeStructure` eliminates this vulnerability by decoupling monetary amounts from client input and storing authoritative rates on the backend under strict institutional multi-tenancy.

## 2. Entity Relationships
```
   Institution (institutionId)
        ├── Student (belongs to an Institution, enrolled in a Branch)
        └── FeeStructure (defines authorized tuition per Branch and Academic Year)
```
- **Institution (`institutionId`)**: Represents the educational institution/college.
- **Student**: Contains authenticated identity, registered `branch` (e.g., `CSE`, `ECE`), and associated `institutionId`.
- **FeeStructure**: Defines the authoritative `tuitionFee` for an `(institutionId, branch, academicYear)` tuple.

## 3. Natural Compound Key
A fee schedule is authoritatively identified by three attributes:
1. `institutionId` (ObjectId referencing `Institution`)
2. `branch` (String, normalized uppercase, e.g. `"CSE"`)
3. `academicYear` (Integer: 1, 2, 3, or 4)

A compound unique database index guarantees that an institution cannot define duplicate active fee structures for the same branch and academic year:
```javascript
feeStructureSchema.index({ institutionId: 1, branch: 1, academicYear: 1 }, { unique: true });
```

## 4. Why the Client Must Not Be Trusted
In any financial transaction flow:
- The client UI may present fee breakdowns for user convenience, but the **server must independently resolve the amount to charge**.
- Submitting an arbitrary `amount` in an HTTP request payload allows trivial tampering (e.g. paying ₹1 instead of full tuition).
- Client-provided amounts must be ignored or rejected by the payment gateway controller.

## 5. Stage 2 Integration Roadmap
In Stage 2, `paymentController.js` (`/api/v10/payfees`) will be hardened:
1. Authenticate the student identity via `req.studentId` from the verified JWT.
2. Load the student's authentic `institutionId` and `branch` from the database.
3. Validate the student's requested `year` (1–4).
4. Call `feeStructureService.getFeeStructure({ institutionId, branch, academicYear })`.
5. Populate Stripe line items with `structure.tuitionFee`, ignoring any client-supplied amount.
