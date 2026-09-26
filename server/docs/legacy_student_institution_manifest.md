# Legacy Student Institution Assignment Manifest (Dry-Run Artifact)

**Status:** PENDING HUMAN & ADMINISTRATIVE REVIEW (Zero Database Writes)  
**Generated At:** 2026-09-26T18:52:58.917Z  
**Engine:** EduMatrix Multi-Tenant Migration Engine v2.0  

---

## 1. Executive Summary

| Category | Count | Action / Status |
| :--- | :---: | :--- |
| **Total Students in Database** | **23** | Full student population audited |
| **PRESERVED** | **3** | Already bound to verified institution; untouched |
| **AUTHORITATIVE_MATCH** | **0** | Deterministic classroom enrollment evidence |
| **REQUIRES_MANUAL_ASSIGNMENT** | **20** | Unaffiliated; forbidden heuristics ignored; requires manual admin mapping |
| **CONFLICTING_EVIDENCE** | **0** | Conflicting enrollments across multiple institutions |
| **INVALID_ORPHANED_REFERENCE** | **0** | Referenced institution does not exist |

---

## 2. Multi-Tenant Architectural Enforcement Rules

1. **Zero Guesswork Policy**: The migration system **never** uses email domains (including `@miet.ac.in`, `@gmail.com`, or any domain), academic branches (`CSE`, `ME`), batches, or roll numbers to deduce an institution.
2. **Authoritative Evidence Hierarchy**:
   - **Tier A (PRESERVED)**: Existing valid `Student.institutionId` referencing an active institution.
   - **Tier B (AUTHORITATIVE_MATCH)**: Unambiguous active classroom enrollment (`Student → Enrollment → Classroom → institutionId`).
   - **Tier C (MANUAL_MANIFEST_ASSIGNED)**: Explicit administrator approval via verified migration manifest.
   - **Tier D (REQUIRES_MANUAL_ASSIGNMENT)**: All unaffiliated students without active classroom links remain unassigned.
3. **Dry-Run Enforcement**: This manifest represents a **read-only proposal**. Zero database write operations were executed.

---

## 3. Preserved Students (3)

Students who already possess a valid, verified `institutionId` referencing an existing institution. These records are **excluded from migration candidates** and remain untouched.

| Student ID | Masked Email | Name | Branch | Batch | Current Institution ID | Verified Institution Name | Center Code |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `67e2a1349e092c1be188cce5` | `di***8@gmail.com` | Himanshu Dinkar  | CSE | 2020-2024 | `6aaadbc1409e39bdb4966780` | **nishu10** | `77777` |
| `6aaae856409e39bdb49667da` | `lo***l@gmail.com` | hello11 | CSE | 2021-2025 | `6aaadbc1409e39bdb4966780` | **nishu10** | `77777` |
| `6aab0a068131c101a04490c0` | `na***i@gmail.com` | nautanki | Chemical Engineering | 2021-2025 | `6aaadbc1409e39bdb4966780` | **nishu10** | `77777` |

---

## 4. Migration Candidates & Legacy Student Action Items (20)

The following students currently lack a valid `institutionId`. Each entry details the classification, evidence source, and required administrative action.

### 1. Student: `674c664ec9a2841402ecd475`
- **Name**: Govind
- **Masked Email**: `go***2@miet.ac.in`
- **Masked Roll No**: `22***38`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 2. Student: `674c67a2c9a2841402ece8ea`
- **Name**: Ayush
- **Masked Email**: `ay***2@miet.ac.in`
- **Masked Roll No**: `22***94`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 3. Student: `674c6825c9a2841402ece8ed`
- **Name**: Aman
- **Masked Email**: `am***2@miet.ac.in`
- **Masked Roll No**: `22***33`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 4. Student: `674c6979c9a2841402ecee3c`
- **Name**: Shivam Saini
- **Masked Email**: `sh***2@miet.ac.in`
- **Masked Roll No**: `22***89`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 5. Student: `674c6be3c9a2841402ecf95d`
- **Name**: Akash Sharma
- **Masked Email**: `ak***2@miet.ac.in`
- **Masked Roll No**: `22***36`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 6. Student: `674c87e3fb442f0164ffc6ad`
- **Name**: Aaditya Sharma
- **Masked Email**: `aa***2@miet.ac.in`
- **Masked Roll No**: `22***02`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 7. Student: `6767f29a7bb938c8d2011219`
- **Name**: Vikas
- **Masked Email**: `he***o@gmail.com`
- **Masked Roll No**: `22***72`
- **Branch**: CSE
- **Batch**: 2019-2023
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 8. Student: `67e2d723a0d2835d768466ef`
- **Name**: hello
- **Masked Email**: `h***@gmail.com`
- **Masked Roll No**: `88***68`
- **Branch**: Chemical Engineering
- **Batch**: 2021-2025
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 9. Student: `67ed6a107d3cbfa906a3b643`
- **Name**: sarthak
- **Masked Email**: `sa***k@gmail.com`
- **Masked Roll No**: `12***34`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 10. Student: `6803a2a020034d2452ffbf89`
- **Name**: N/A
- **Masked Email**: `***`
- **Masked Roll No**: `N/***/A`
- **Branch**: N/A
- **Batch**: N/A
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 11. Student: `6808c675090814e7954ccff2`
- **Name**: Himanshu dinkar
- **Masked Email**: `di***r@gmail.com`
- **Masked Roll No**: `22***59`
- **Branch**: CSE
- **Batch**: 2017-2021
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 12. Student: `6809f907f518dd9a2f11c18c`
- **Name**: HImanshu dinkar
- **Masked Email**: `hi***u@gmail.com`
- **Masked Roll No**: `22***67`
- **Branch**: Chemical Engineering
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 13. Student: `68202335dbd404c2ce02025c`
- **Name**: Atul
- **Masked Email**: `12***3@g`
- **Masked Roll No**: `***`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 14. Student: `6884866dd8543fee560d45f6`
- **Name**: Ayush
- **Masked Email**: `ay***9@gmail.com`
- **Masked Roll No**: `22***67`
- **Branch**: Mechanical Engineering
- **Batch**: 2020-2024
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 15. Student: `6884881cd8543fee560d476b`
- **Name**: Itachi
- **Masked Email**: `it***i@gmail.com`
- **Masked Roll No**: `69***69`
- **Branch**: CSE AI
- **Batch**: 2020-2024
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 16. Student: `6884b199b8879bdbd4551493`
- **Name**: new
- **Masked Email**: `pi***c@gmail.com`
- **Masked Roll No**: `77***77`
- **Branch**: Electronics Engineering
- **Batch**: 2020-2024
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 17. Student: `6884b761b8879bdbd45515c4`
- **Name**: test
- **Masked Email**: `te***t@gmail.com`
- **Masked Roll No**: `84***87`
- **Branch**: Chemical Engineering
- **Batch**: 2020-2024
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 18. Student: `68ab355f60f1ff00416b570c`
- **Name**: nishu
- **Masked Email**: `ni***u@gmail.com`
- **Masked Roll No**: `88***88`
- **Branch**: Chemical Engineering
- **Batch**: 2020-2024
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 19. Student: `68de55acdcad1e8fe777a349`
- **Name**: Smita
- **Masked Email**: `sm***a@gmail.com`
- **Masked Roll No**: `77***77`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

### 20. Student: `6a46416d584f4ca30712df86`
- **Name**: whattttt
- **Masked Email**: `mi***h@gmail.com`
- **Masked Roll No**: `12***41`
- **Branch**: CSE
- **Batch**: 2022-2026
- **Current `institutionId`**: `null`
- **Classification**: **`REQUIRES_MANUAL_ASSIGNMENT`**
- **Classification Reason**: No valid institutionId and no active classroom enrollment providing institutionId
- **Evidence Source**: None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)
- **Detected Institution**: *None*
- **Requires Manual Approval**: `true`
- **Action**: Human administrator must explicitly select and assign the target institution before any database update.

---

## 5. Candidate Summary by Action Group

### Group 1 — Eligible for Direct Administrative Approval (0)
*None. No unassigned students currently possess active classroom enrollments.*

### Group 2 — Requires Explicit Administrative Institution Assignment (20)
- **Institutional Domain Records (e.g. `@miet.ac.in`)**: 6 students
  - *Note*: While these students share an institutional domain, no canonical institution for MIET exists in the database. An administrator must provision the canonical institution and formally approve the assignment.
- **Public Email Domain Records (`@gmail.com`)**: 12 students
  - *Note*: Unambiguously unresolvable by automatic heuristics. Requires academic administrators to identify student campus via enrollment records or registrar files.
- **Malformed / Incomplete Records**: 2 students
  - *Note*: Corrupted test artifacts (`12***3@g` and `***` with undefined branch). Recommend administrative archival or deletion.

### Group 3 — Conflicting Evidence (0)
*None. No students have conflicting cross-institution enrollments.*

### Group 4 — Orphaned References (0)
*None. No students point to deleted institutions.*

---

## 6. Verification & Sign-Off Checklist Before Migration

- [ ] Canonical Institution records confirmed and provisioned by System Administrator.
- [ ] Administrative assignments mapped for all Category 2 students in an approved manifest.
- [ ] Staging dry-run executed with `--manifest=<path>` producing matching hash.
- [ ] Verified that payment controller continues to block unassigned students until explicit migration completes.
