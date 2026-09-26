/*
Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Service for analyzing, classifying, and generating dry-run manifests
 * for legacy student institution assignments.
 *
 * STRICT MULTI-TENANT ARCHITECTURAL PRINCIPLE:
 * EduMatrix is institution-agnostic and multi-tenant.
 * Email domains (e.g. @miet.ac.in, @gmail.com, @*.edu, @*.ac.in) are STRICTLY NON-AUTHORITATIVE
 * and MUST NEVER be used to infer, determine, or validate a student's institution.
 *
 * Authoritative Evidence Hierarchy:
 * Tier A: Existing valid Student.institutionId (referencing an active, verified Institution) -> PRESERVED
 * Tier B: Deterministic Classroom Enrollment (Student -> Enrollment -> Classroom -> institutionId)
 *         (Only authoritative when unambiguous: all active enrollments belong to the exact same institution)
 *         -> AUTHORITATIVE_MATCH
 * Tier C: Explicit Administrator-Approved Assignment (from an authorized migration manifest)
 *         -> AUTHORITATIVE_MATCH (MANUAL_MANIFEST_ASSIGNED)
 * Tier D: Conflicting enrollments across multiple institutions -> CONFLICTING_EVIDENCE
 * Tier E: Everything else -> REQUIRES_MANUAL_ASSIGNMENT (remains unassigned)
 */

/**
 * Classifies a student record according to the authoritative evidence hierarchy.
 *
 * @param {Object} student - The student document or plain object.
 * @param {Object} [context={}] - Database context for relational verification.
 * @param {Array|Map} [context.institutions] - Verified Institution documents or collection/map.
 * @param {Array|Map} [context.classrooms] - Classroom documents with { _id, institutionId }.
 * @param {Array} [context.enrollments] - Enrollment documents with { studentId, classroomId, status }.
 * @param {Object|Map} [context.approvedManifest] - Explicit map of studentId -> approved institutionId.
 * @returns {Object} Classification result
 */
function classifyStudentInstitution(student, context = {}) {
  if (!student) {
    throw new Error("Student record is required for classification");
  }

  const {
    institutions = [],
    classrooms = [],
    enrollments = [],
    approvedManifest = null,
  } = context;

  // Build helper lookup sets/maps
  const institutionMap = new Map();
  if (Array.isArray(institutions)) {
    for (const inst of institutions) {
      if (inst && inst._id) institutionMap.set(inst._id.toString(), inst);
      else if (inst) institutionMap.set(inst.toString(), { _id: inst.toString() });
    }
  } else if (institutions instanceof Map) {
    for (const [key, val] of institutions.entries()) {
      institutionMap.set(key.toString(), val);
    }
  }

  const classroomMap = new Map();
  if (Array.isArray(classrooms)) {
    for (const c of classrooms) {
      if (c && c._id) classroomMap.set(c._id.toString(), c);
    }
  } else if (classrooms instanceof Map) {
    for (const [k, v] of classrooms.entries()) {
      classroomMap.set(k.toString(), v);
    }
  }

  const studentIdStr = student._id ? student._id.toString() : null;

  // Tier A: Existing valid student.institutionId
  if (student.institutionId) {
    const assignedInstStr = student.institutionId.toString();
    const verifiedInst = institutionMap.get(assignedInstStr);

    if (institutionMap.size > 0 && !verifiedInst) {
      return {
        classification: "INVALID_ORPHANED_REFERENCE",
        classificationReason: `Referenced institutionId (${assignedInstStr}) does not exist in institutions collection`,
        detectedInstitutionId: null,
        detectedInstitutionName: null,
        detectedInstitutionCenterCode: null,
        evidenceSource: "Dangling Foreign Key",
        requiresManualApproval: true,
        canAutoMigrate: false,
        // Backward compatibility aliases
        status: "INVALID_ORPHANED_REFERENCE",
        institutionId: null,
        reason: `Referenced institutionId (${assignedInstStr}) does not exist in institutions collection`,
      };
    }

    return {
      classification: "PRESERVED",
      classificationReason: "Student already possesses an authoritative, verified institutionId",
      detectedInstitutionId: assignedInstStr,
      detectedInstitutionName: verifiedInst ? verifiedInst.name : null,
      detectedInstitutionCenterCode: verifiedInst ? verifiedInst.centerCode : null,
      evidenceSource: "Student.institutionId",
      requiresManualApproval: false,
      canAutoMigrate: false,
      // Backward compatibility aliases
      status: "PRESERVED",
      institutionId: student.institutionId,
      reason: "Student already possesses an authoritative, verified institutionId",
    };
  }

  // Tier B: Deterministic Classroom Enrollment
  if (studentIdStr && Array.isArray(enrollments) && enrollments.length > 0) {
    const studentEnrollments = enrollments.filter((e) => {
      const eStudentId = e.studentId ? e.studentId.toString() : null;
      const status = (e.status || "enrolled").toLowerCase();
      return eStudentId === studentIdStr && status !== "dropped";
    });

    if (studentEnrollments.length > 0) {
      const associatedInstIds = new Set();
      for (const e of studentEnrollments) {
        const cId = e.classroomId ? e.classroomId.toString() : null;
        const classroom = classroomMap.get(cId);
        if (classroom && classroom.institutionId) {
          associatedInstIds.add(classroom.institutionId.toString());
        }
      }

      if (associatedInstIds.size === 1) {
        const targetInstId = Array.from(associatedInstIds)[0];
        const verifiedInst = institutionMap.get(targetInstId);

        if (institutionMap.size === 0 || verifiedInst) {
          return {
            classification: "AUTHORITATIVE_MATCH",
            classificationReason: `Unambiguous active classroom enrollment deterministically establishes institution (${targetInstId})`,
            detectedInstitutionId: targetInstId,
            detectedInstitutionName: verifiedInst ? verifiedInst.name : null,
            detectedInstitutionCenterCode: verifiedInst ? verifiedInst.centerCode : null,
            evidenceSource: "Student -> Enrollment -> Classroom -> Classroom.institutionId",
            requiresManualApproval: false,
            canAutoMigrate: true,
            // Backward compatibility aliases
            status: "AUTHORITATIVE_MATCH",
            institutionId: targetInstId,
            reason: `Unambiguous active classroom enrollment deterministically establishes institution (${targetInstId})`,
          };
        }
      } else if (associatedInstIds.size > 1) {
        return {
          classification: "CONFLICTING_EVIDENCE",
          classificationReason: `Student is enrolled in classrooms spanning multiple distinct institutions (${Array.from(associatedInstIds).join(", ")}); requires manual administrator resolution`,
          detectedInstitutionId: null,
          detectedInstitutionName: null,
          detectedInstitutionCenterCode: null,
          evidenceSource: "Conflicting Classroom Enrollments",
          requiresManualApproval: true,
          canAutoMigrate: false,
          // Backward compatibility aliases
          status: "CONFLICTING_EVIDENCE",
          institutionId: null,
          reason: `Student is enrolled in classrooms spanning multiple distinct institutions (${Array.from(associatedInstIds).join(", ")}); requires manual administrator resolution`,
        };
      }
    }
  }

  // Tier C: Explicit Administrator-Approved Manifest
  if (studentIdStr && approvedManifest) {
    let manifestInstId = null;
    if (approvedManifest instanceof Map) {
      manifestInstId = approvedManifest.get(studentIdStr);
    } else if (typeof approvedManifest === "object") {
      manifestInstId = approvedManifest[studentIdStr];
    }

    if (manifestInstId) {
      const manifestInstStr = manifestInstId.toString();
      const verifiedInst = institutionMap.get(manifestInstStr);

      if (institutionMap.size === 0 || verifiedInst) {
        return {
          classification: "AUTHORITATIVE_MATCH",
          classificationReason: "Explicit administrator-approved institution assignment from verified migration manifest",
          detectedInstitutionId: manifestInstStr,
          detectedInstitutionName: verifiedInst ? verifiedInst.name : null,
          detectedInstitutionCenterCode: verifiedInst ? verifiedInst.centerCode : null,
          evidenceSource: "Administrator Approved Manifest",
          requiresManualApproval: false,
          canAutoMigrate: true,
          // Backward compatibility aliases
          status: "MANUAL_MANIFEST_ASSIGNED",
          institutionId: manifestInstId,
          reason: "Explicit administrator-approved institution assignment from verified migration manifest",
        };
      }
    }
  }

  // Tier D / Fallback: Everything else
  // CRITICAL: Email domains, branches, batches, names, or roll numbers are strictly non-authoritative
  // and MUST NEVER be used to guess or infer an institution.
  return {
    classification: "REQUIRES_MANUAL_ASSIGNMENT",
    classificationReason: "No valid institutionId and no active classroom enrollment providing institutionId",
    detectedInstitutionId: null,
    detectedInstitutionName: null,
    detectedInstitutionCenterCode: null,
    evidenceSource: "None (Forbidden Heuristics: Email domain, branch, batch, roll number ignored)",
    requiresManualApproval: true,
    canAutoMigrate: false,
    // Backward compatibility aliases
    status: "REQUIRES_INSTITUTION_ASSIGNMENT",
    institutionId: null,
    reason: "No authoritative database relationship exists; email domain and academic branch cannot be used to infer tenant assignment",
  };
}

/**
 * Generates a structured dry-run institution assignment manifest for a collection of students.
 * Performs zero database writes.
 *
 * @param {Array} students - List of student documents
 * @param {Object} [context={}] - Relational context
 * @returns {Object} Manifest object { summary, candidates, allEntries }
 */
function generateInstitutionManifest(students = [], context = {}) {
  const allEntries = [];
  const candidates = [];

  let alreadyAssigned = 0;
  let authoritativeMatches = 0;
  let requiresManualAssignment = 0;
  let conflictingEvidence = 0;
  let invalidOrphanedReferences = 0;

  for (const student of students) {
    const classification = classifyStudentInstitution(student, context);

    const entry = {
      studentId: student._id ? student._id.toString() : "unknown",
      name: student.name || "N/A",
      email: student.email || "N/A",
      rollNo: student.rollNo !== undefined ? student.rollNo : "N/A",
      branch: student.branch || "N/A",
      batch: student.batch || "N/A",
      currentInstitutionId: student.institutionId ? student.institutionId.toString() : null,
      classification: classification.classification,
      classificationReason: classification.classificationReason,
      detectedInstitutionId: classification.detectedInstitutionId,
      detectedInstitutionName: classification.detectedInstitutionName,
      detectedInstitutionCenterCode: classification.detectedInstitutionCenterCode,
      evidenceSource: classification.evidenceSource,
      requiresManualApproval: classification.requiresManualApproval,
    };

    allEntries.push(entry);

    switch (classification.classification) {
      case "PRESERVED":
        alreadyAssigned++;
        break;
      case "AUTHORITATIVE_MATCH":
        authoritativeMatches++;
        candidates.push(entry);
        break;
      case "REQUIRES_MANUAL_ASSIGNMENT":
        requiresManualAssignment++;
        candidates.push(entry);
        break;
      case "CONFLICTING_EVIDENCE":
        conflictingEvidence++;
        candidates.push(entry);
        break;
      case "INVALID_ORPHANED_REFERENCE":
        invalidOrphanedReferences++;
        candidates.push(entry);
        break;
    }
  }

  const summary = {
    totalStudents: students.length,
    alreadyAssigned,
    authoritativeMatches,
    requiresManualAssignment,
    conflictingEvidence,
    invalidOrphanedReferences,
    generatedAt: new Date().toISOString(),
  };

  return {
    summary,
    candidates,
    allEntries,
  };
}

module.exports = {
  classifyStudentInstitution,
  generateInstitutionManifest,
};
