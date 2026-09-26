# Legacy Institution Migration Architecture & Authoritative Evidence Hierarchy

## 1. Multi-Tenant Architectural Principle

EduMatrix is strictly **institution-agnostic and multi-tenant**.

The single authoritative relationship establishing a student's tenant affiliation is:

```text
Student.institutionId → Institution._id
```

### Absolute Rule on Email Domains
**Email domains (e.g. `@miet.ac.in`, `@gmail.com`, `@university.edu`, etc.) are STRICTLY NON-AUTHORITATIVE.**
The system must **never** infer, determine, or validate a student's institution from their email domain.
Historical values such as `@miet.ac.in` were observed during the Stage 3A audit as legacy test data and are **strictly prohibited as business or migration rules**.

---

## 2. Authoritative Evidence Hierarchy

When resolving legacy student records with missing `institutionId`, the migration system adheres to a strict 4-tier hierarchy:

### Tier A — Existing Valid `Student.institutionId`
* **Status**: `PRESERVED`
* **Authority**: Fully Authoritative.
* **Rule**: If a student already possesses an `institutionId` and that institution exists in the `institutions` collection, the record is **left untouched**. The migration system will never overwrite an existing valid institution assignment.

### Tier B — Deterministic Classroom Enrollment (`Student → Enrollment → Classroom → Institution`)
* **Status**: `AUTHORITATIVE_ENROLLMENT_MATCH`
* **Authority**: Relational Database Authority.
* **Rule**: When an unaffiliated student is enrolled in one or more classrooms that all unambiguously belong to the **exact same institution**, that relationship deterministically proves the student's campus assignment (consistent with `enrollmentController.js` lines 122–126).
* **Exception**: If a student's enrollments span multiple distinct institutions, automatic assignment is prohibited and the record is escalated to Tier D (`REQUIRES_INSTITUTION_ASSIGNMENT`).

### Tier C — Explicit Administrator-Approved Manifest
* **Status**: `MANUAL_MANIFEST_ASSIGNED`
* **Authority**: Human Administrative Authority.
* **Rule**: An authorized administrator reviews unassigned students and provides an explicit mapping manifest (`studentId → institutionId`). The target `institutionId` must be verified against the `institutions` collection before assignment.

### Tier D — Fallback: Everything Else
* **Status**: `REQUIRES_INSTITUTION_ASSIGNMENT`
* **Authority**: None.
* **Rule**: If a student lacks both valid `institutionId`, unambiguous classroom enrollments, and an approved manifest entry, the system **leaves `institutionId` unset (`null`)**.
* **Forbidden Heuristics**: The system must NOT guess the institution using:
  - Email domain (`@miet.ac.in`, `@gmail.com`, etc.)
  - Academic branch (`CSE`, `Mechanical Engineering`, etc.)
  - Batch year (`2022-2026`, etc.)
  - Roll number patterns
  - Student name
  - Admin `collegeName`

---

## 3. Classification Service (`legacyInstitutionMigrationService.js`)

The classification engine is implemented in `server/services/legacyInstitutionMigrationService.js`:

```javascript
const { classifyStudentInstitution } = require('../services/legacyInstitutionMigrationService');

const result = classifyStudentInstitution(student, {
  institutions,
  classrooms,
  enrollments,
  approvedManifest,
});
// Returns:
// {
//   status: 'PRESERVED' | 'AUTHORITATIVE_ENROLLMENT_MATCH' | 'MANUAL_MANIFEST_ASSIGNED' | 'REQUIRES_INSTITUTION_ASSIGNMENT',
//   institutionId: ObjectId | string | null,
//   reason: string,
//   canAutoMigrate: boolean
// }
```

---

## 4. Payment Isolation for Unassigned Students

As enforced in Stage 2 payment hardening (`server/controllers/paymentController.js`):
- Any student with `institutionId == null` is rejected at `/api/v10/payfees` with `HTTP 400 Bad Request`.
- This ensures zero un-scoped payments, zero fee calculation without institution context, and zero tenant bypasses can occur while legacy students await explicit administrative assignment.
