# Canonical Institution Resolution Audit (Stage 3C)

**Status:** AUDIT COMPLETE — READ-ONLY  
**Date:** 2026-09-27  
**Database Modification:** **ZERO WRITES** (Verified before and after)  
**Final Resolution:** **`INSUFFICIENT_EVIDENCE`**

---

## 1. Executive Summary

This audit evaluated the EduMatrix MongoDB database to determine whether sufficient authoritative evidence exists to establish a canonical Institution record for the 20 legacy students currently lacking an `institutionId`.

In accordance with multi-tenant zero-guesswork rules, institution identity must **never** be inferred from weak heuristics such as student email domains (e.g. `@miet.ac.in`, `@gmail.com`), academic branches, batches, roll numbers, or free-form administrator `collegeName` strings.

### Key Audit Findings:
1. **Existing Institutions (6 Total)**: All 6 existing Institution documents are test/isolated tenant records (`nishu10`, `nishu11`, `ABDURAHMAN`, `ABDURAHMAN1`, `ABDURAHMAN2`, `Raman`). None have any authoritative or legitimate relationship to the 20 legacy students.
2. **Admin Records (200 Total)**: 19 admin records contain informal, free-form references to "MIET" or "Meerut". However, they exhibit **severe center code conflict** (16 distinct center codes observed, including `128`, `97593`, `939`, `9845984`, `9488`, `2001`, `49779`, `333`, `4549`, `84564`, `998`, `992`, `42423`, `12345`, `1234`, `111`). Zero MIET-related admin records possess a populated `institutionId`.
3. **Classrooms (3 Total) & Enrollments (6 Total)**: All classrooms and enrollments exclusively link the 3 preserved students to institution `nishu10`. Exactly **0** legacy students have classroom enrollments.
4. **Registrar Data**: `server/models/registrarModels.js` exports an empty object (`{}`), rendering it `NOT_AVAILABLE`. The `registrarfees` collection (506 records) contains student fees, roll numbers, and branches, but contains zero institutional identifiers or center codes.
5. **Final Determination**: **`INSUFFICIENT_EVIDENCE`**. The database does not contain authoritative evidence to confirm a canonical institution name or a canonical center code for the legacy records. A system administrator must explicitly confirm and provision the canonical institution before any migration can take place.

---

## 2. Existing Institutions Inventory

Inspection of the `institutions` collection revealed 6 documents:

| Institution ID | Name | Center Code | Created At | Associated Tenants / Notes |
| :--- | :--- | :---: | :--- | :--- |
| `6aaadbc1409e39bdb4966780` | `nishu10` | `77777` | 2026-09-16T18:11:13Z | Referenced by 1 admin, 3 classrooms, and the 3 preserved students |
| `6aaae7f5409e39bdb49667d2` | `nishu11` | `77777` | 2026-09-16T19:03:17Z | Referenced by 1 admin (`ni***3@gmail.com`); 0 students, 0 classrooms |
| `6aad51e7b9b008514d57742c` | `ABDURAHMAN` | `1` | 2026-09-18T14:59:51Z | Referenced by 1 admin (`AB***F@GMAIL.COM`); 0 students, 0 classrooms |
| `6aad528ab9b008514d577441` | `ABDURAHMAN1` | `0` | 2026-09-18T15:02:34Z | Referenced by 1 admin (`AB***1`); 0 students, 0 classrooms |
| `6aad53e3b9b008514d57745b` | `ABDURAHMAN2` | `222` | 2026-09-18T15:08:19Z | Referenced by 1 admin (`AB***2`); 0 students, 0 classrooms |
| `6ab103554355bb1d62df5aef2`| `Raman` | `4` | 2026-09-21T10:13:41Z | Referenced by 1 admin (`an***8@gmail.com`); 0 students, 0 classrooms |

### Analysis of Existing Institution `nishu10` (`6aaadbc1409e39bdb4966780`)
- **Name**: "nishu10"
- **Center Code**: 77777
- **Relationship to Legacy Records**: **NONE**.
- There are no foreign key relationships, shared domain linkages, or classroom enrollments between `nishu10` and the 20 legacy students.
- `nishu10` is an isolated test tenant. Conflating legacy students with `nishu10` would constitute a cross-tenant data corruption violation.

---

## 3. Admin Evidence & Center Code Conflicts

Across all 200 Admin documents in the database:
- Only **6 admins** have a populated `institutionId` (linking to the 6 test institutions above).
- **194 admins** have `institutionId: null` or undefined.
- **19 admins** reference "MIET" or "Meerut" in `collegeName` or `email`. Every single one has `institutionId: null`.

### Inventory of MIET / Meerut-Related Admin Records:

| Admin ID | Director / User Name | Observed `collegeName` | Observed `centerCode` | Role | Masked Email | `institutionId` |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| `6733951efe744217829cab67` | Mr Suresh Prabhu | Meerut Institue of Enginnering and Technology | 128 | undefined | `mi***t@gmail.com` | `NONE` |
| `673395f0fe744217829cab6c` | Mr Suresh Prabhu | Meerut Institue of Enginnering and Technology | 128 | undefined | `mi***1@gmail.com` | `NONE` |
| `6735b7400ad2e1afbc0b5a44` | Ankur kumar | Meerut Istitute of Engineering and Technology | 97593 | undefined | `di***r@gmail.com` | `NONE` |
| `6735b9b8a2f364a16e006245` | ankur kumar | miet | 939 | undefined | `dn***r@gmail.com` | `NONE` |
| `6735b9fda2f364a16e006248` | ankur kumar | miet | 9845984 | undefined | `di***u@gmail.com` | `NONE` |
| `6735be7b712a7c6c0e2c664d` | director | meerut | 9488 | undefined | `me***t@gmail.com` | `NONE` |
| `6735eb8c2ae8f058f61767d9` | harshita | miet | 2001 | undefined | `ha***9@gmail.com` | `NONE` |
| `6735ec6f2ae8f058f61767de` | harshita | miet | 2001 | undefined | `ha***3@gmail.com` | `NONE` |
| `6744bd689ee3ee2dbfd53ee4` | himanshu dinkar | Meerut Institute of Engineering Technology | 49779 | admin | `de***4@gmail.com` | `NONE` |
| `6744bd999ee3ee2dbfd53ee7` | himanshu | Meerut Institute of Engineering Technology | 333 | admin | `he***3@gmail.com` | `NONE` |
| `6744bddbf2ff8b6d04e82915` | nishu | Meerut Institute of Engineering Technology | 4549 | admin | `he***1@gmail.com` | `NONE` |
| `6745c17cb8d804e2acb60c1f` | Himanshu dinkar | Meerut Institute of Enginnering and Technology | 84564 | admin | `hi***7@gmail.com` | `NONE` |
| `6766f290ae7c83e230e0cffb` | Himanshu Dinkar | Himanshu Dinkar | 998 | Director | `hi***2@miet.ac.in` | `NONE` |
| `6767d24b3db3669705713784` | Himanshu Dinkar | Devil Institute of Technology | 992 | Teacher | `me***t@miet.ac.in` | `NONE` |
| `6767e3e8f56716c1430bc05f` | fsfsfs2 | gedgd | 42423 | Teacher | `ay***3@miet.in` | `NONE` |
| `67e7da2a9b0ff97da2c37f51` | xyz | meerutabc | 12345 | Teacher | `ab***l` | `NONE` |
| `67ec18844fd4e6f123d1e95d` | Asdf | Miet | 1234 | Director | `sh***m@gmail.com` | `NONE` |
| `67ec1c514fd4e6f123d1e9ab` | Akash Sharma | MIET | 111 | Director | `ak***m@gmsil.com` | `NONE` |
| `67ec1d384fd4e6f123d1e9bf` | A | ABST | 111 | Director | `ak***2@miet.ac.in` | `NONE` |

### Critical Observations on Admin Evidence:
1. **Severe Center Code Conflicts**: 16 distinct center codes appear across 19 records. None can be selected on frequency or numerical plausibility (e.g., `128` has 2 records, `2001` has 2 records, `111` has 2 records, `939` has 1 record, `9845984` has 1 record, `1234` has 1 record).
2. **Inconsistent and Typo-Ridden College Names**: "Meerut Institue of Enginnering and Technology", "Meerut Istitute of Engineering and Technology", "Meerut Institute of Engineering Technology", "miet", "Miet", "MIET".
3. **No Authoritative Database Link**: Not a single one of these admins links to an `institution` document.

---

## 4. Classroom Evidence

Inspection of the `classrooms` collection revealed 3 documents:
- `6aaae752409e39bdb49667b4`: CS-400 (Operating System), Branch: CSE, Batch: 2026, `institutionId: 6aaadbc1409e39bdb4966780`
- `6aab00e38131c101a0448f1a`: CS-300 (Computer Networks), Branch: CSE, Batch: 2026, `institutionId: 6aaadbc1409e39bdb4966780`
- `6aab01ad8131c101a0448fa3`: CS-307 (computer systems), Branch: CSE, Batch: 2026, `institutionId: 6aaadbc1409e39bdb4966780`

**Findings**:
- All 3 classrooms point exclusively to `6aaadbc1409e39bdb4966780` ("nishu10").
- Zero classrooms exist for MIET or any other institution.
- No classroom metadata contains any college or center references.

---

## 5. Enrollment Evidence

Inspection of the `enrollments` collection revealed 6 documents:
- `6aaaea98f425340a1f6079bd`: Classroom CS-400, Student `6aaae856409e39bdb49667da` (hello11)
- `6aaaefb395d09a5fde1af397`: Classroom CS-400, Student `67e2a1349e092c1be188cce5` (Himanshu Dinkar)
- `6aab01618131c101a0448f4d`: Classroom CS-300, Student `67e2a1349e092c1be188cce5` (Himanshu Dinkar)
- `6aab01bf8131c101a0448fae`: Classroom CS-307, Student `67e2a1349e092c1be188cce5` (Himanshu Dinkar)
- `6aab093d8131c101a0449082`: Classroom CS-307, Student `6aaae856409e39bdb49667da` (hello11)
- `6aab0a138131c101a04490c9`: Classroom CS-307, Student `6aab0a068131c101a04490c0` (nautanki)

**Findings**:
- All 6 enrollments belong to the 3 preserved students already bound to institution `nishu10`.
- **Authoritative enrollment matches among legacy students = 0**.
- Zero legacy students can be linked to any institution through enrollment relationships.

---

## 6. Student Evidence

Inspection of the 20 legacy students missing `institutionId`:
- **6 Students** have `@miet.ac.in` institutional email domains (Govind, Ayush, Aman, Shivam Saini, Utkarsh, Divyanshu Sharma).
- **12 Students** have `@gmail.com` public email domains.
- **2 Students** have corrupted/malformed identifiers (`12***3@g`, and an unnamed record with branch `undefined`).
- **Zero students** possess a valid `institutionId`.
- **Classification**: Under strict multi-tenant architecture, email domains, branches, batches, and roll numbers are non-authoritative. They cannot be used to deduce an institution.

---

## 7. Registrar & Fee Evidence

### A. `server/models/registrarModels.js`
- **Module Inspection**: The file defines `registrarSchema` locally with a `name` field, but contains **no export** (`module.exports` is `{}`).
- **Status**: **`NOT_AVAILABLE`**.
- **Reason**: The application export is not a directly queryable Mongoose model.

### B. `server/models/registrarFees.js` (`registrarfees` collection)
- **Module Inspection**: Exports `registrarFeesModel` mapping to collection `registrarfees`.
- **Document Count**: 506 records.
- **Fields Present**: `RollNumber` (Number), `Name` (String), `Fees` (Number), `Fees_status` (String), `Branch` (String).
- **Authoritative Institution Reference**: **NONE**. The schema and records do not contain `institutionId`, `centerCode`, `collegeName`, or campus metadata.
- **Classification**: **`UNSAFE_FOR_IDENTITY`**.

---

## 8. Evidence Classification Table

| Source | Evidence | Classification | Reason |
| :--- | :--- | :--- | :--- |
| `Student.institutionId` | 3 students reference `6aaadbc1409e39bdb4966780`; 20 have `null` | **`AUTHORITATIVE`** | Direct database tenancy relationship (applies strictly to the 3 preserved students) |
| `Enrollment → Classroom → Institution` | 6 enrollments link preserved students to `nishu10`; 0 legacy links | **`AUTHORITATIVE`** | Deterministic relational database foreign key chain |
| `Admin.institutionId` | 6 admins reference test institutions; 194 admins have `null` | **`AUTHORITATIVE`** | Explicit database foreign key |
| `Admin.collegeName` | Free-form strings ("miet", "MIET", "Miet", "Meerut Institue...") | **`AMBIGUOUS`** | Unvalidated human text with inconsistent casing, typos, and abbreviations |
| `Admin.centerCode` | 16 conflicting numeric values (128, 939, 9845984, 2001, 1234, 111, etc.) | **`REQUIRES_ADMIN_CONFIRMATION`** | Unvalidated test input across different admin registrations; frequency is not proof |
| `Student.email` domain | `@miet.ac.in` (6), `@gmail.com` (12), malformed (2) | **`UNSAFE_FOR_IDENTITY`** | Non-authoritative heuristic; violates multi-tenant tenant isolation |
| `Student.branch` / `batch` | "CSE", "Chemical Engineering"; 2022-2026, etc. | **`UNSAFE_FOR_IDENTITY`** | Academic curriculum metadata common across all institutions |
| `Student.rollNo` | Numeric identifiers (e.g. `22***38`) | **`AMBIGUOUS`** | Local sequence number without institutional namespace |
| `RegistrarFees` (`registrarfees`) | 506 records with RollNumber, Name, Fees, Status, Branch | **`UNSAFE_FOR_IDENTITY`** | Contains zero institutional identifiers or center codes |
| `RegistrarModel` (`registrarModels.js`)| Empty export `{}` | **`NOT_AVAILABLE`** | Application export is not a queryable Mongoose model |

---

## 9. Candidate Institution Identity

Based on legacy artifacts and observed registration data:

| Attribute | Proposed / Observed Value | Status | Evidence & Requirement |
| :--- | :--- | :--- | :--- |
| **Observed Identity** | Meerut Institute of Engineering and Technology | **`PROPOSED`** | Observed legacy college name text in admin records; not database-confirmed |
| **Center Code** | *None* | **`REQUIRES_ADMIN_CONFIRMATION`** | 16 conflicting codes in Admin collection; cannot be chosen programmatically |
| **Existing Institution ID** | *None* | **`REQUIRES_ADMIN_CONFIRMATION`** | No existing institution represents MIET |

---

## 10. Final Resolution

### **`INSUFFICIENT_EVIDENCE`**

The database does not contain sufficient authoritative evidence to establish a canonical institution for the legacy records.

#### Missing & Conflicting Information:
1. **Canonical Name**: While "Meerut Institute of Engineering and Technology" is the observed full name, admin records contain multiple conflicting variants and typos.
2. **Center Code**: Admin records exhibit 16 distinct conflicting center codes. The database provides zero authoritative evidence favoring any single code.
3. **Missing Institution Record**: No canonical institution document exists in `institutions`.

#### Required Action Before Provisioning or Migration:
A human administrator must explicitly confirm:
1. The exact canonical institution name (e.g. `Meerut Institute of Engineering and Technology`).
2. The authoritative center code (confirming which numeric code is official).
3. Explicit approval of the legacy student manifest mapping.

---

## 11. Zero-Write Verification

The audit executed strictly read-only operations. Database counts before and after the audit were verified:

| Metric | Before Audit | After Audit | Match Status |
| :--- | :---: | :---: | :---: |
| **Institution count** | 6 | 6 | **MATCH (Unchanged)** |
| **Student count** | 23 | 23 | **MATCH (Unchanged)** |
| **Students with valid institutionId** | 3 | 3 | **MATCH (Unchanged)** |
| **Students without institutionId** | 20 | 20 | **MATCH (Unchanged)** |
| **Admin count** | 200 | 200 | **MATCH (Unchanged)** |
| **Classroom count** | 3 | 3 | **MATCH (Unchanged)** |
| **Enrollment count** | 6 | 6 | **MATCH (Unchanged)** |
| **RegistrarFees count** | 506 | 506 | **MATCH (Unchanged)** |

**Zero database writes occurred.**
