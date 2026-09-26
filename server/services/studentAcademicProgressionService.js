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
 * Resolves a student's academic progression authoritatively from ERP data.
 * Derives admission year, course duration, current academic year, and applicable academic sessions.
 *
 * @param {Object} student - Student document or plain object
 * @param {Date} [currentDate=new Date()] - Reference date for boundary calculations
 * @returns {Object} Academic progression resolution
 */
function resolveStudentAcademicProgression(student, options = {}) {
  if (!student) {
    return {
      status: "UNRESOLVED",
      reason: "Missing student record",
    };
  }

  if (!student.institutionId) {
    return {
      status: "UNRESOLVED",
      reason: "Student is not assigned to an active institution. Tenancy unresolved.",
    };
  }

  if (!student.branch || typeof student.branch !== "string" || !student.branch.trim()) {
    return {
      status: "UNRESOLVED",
      reason: "Student has no department or branch assigned.",
    };
  }

  const rawBatch = (student.batch || "").trim();
  const match = rawBatch.match(/^(\d{4})\s*-\s*(\d{4})$/);

  if (!match) {
    return {
      status: "UNRESOLVED",
      reason: "Student batch information is missing or not in standard format (YYYY-YYYY).",
      batch: rawBatch,
    };
  }

  const admissionYear = parseInt(match[1], 10);
  const graduationYear = parseInt(match[2], 10);
  const courseDuration = graduationYear - admissionYear;

  if (courseDuration < 1 || courseDuration > 6) {
    return {
      status: "UNRESOLVED",
      reason: `Invalid course duration derived from batch: ${courseDuration} years.`,
    };
  }

  // Reference date: supports Date object directly or options.currentDate
  const now =
    options instanceof Date
      ? options
      : options?.currentDate instanceof Date && !isNaN(options.currentDate)
      ? options.currentDate
      : new Date();

  // Institution-configurable academic calendar resolution
  // Defaults to institution-configured values or safe standard parameters without universal hardcoding
  const academicCalendar =
    options?.academicCalendar ||
    options?.institution?.academicCalendar ||
    student?.institution?.academicCalendar ||
    {};

  const startMonth =
    typeof academicCalendar.sessionStartMonth === "number" &&
    academicCalendar.sessionStartMonth >= 1 &&
    academicCalendar.sessionStartMonth <= 12
      ? academicCalendar.sessionStartMonth
      : 7; // Configurable institution default fallback

  const startDay =
    typeof academicCalendar.sessionStartDay === "number" &&
    academicCalendar.sessionStartDay >= 1 &&
    academicCalendar.sessionStartDay <= 31
      ? academicCalendar.sessionStartDay
      : 1;

  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1; // 1-indexed (1 = Jan, 12 = Dec)
  const nowDay = now.getDate();

  // Determine whether current reference date has reached or passed the institution's session start date
  const isPastSessionBoundary =
    nowMonth > startMonth || (nowMonth === startMonth && nowDay >= startDay);

  const currentSessionStartYear = isPastSessionBoundary ? nowYear : nowYear - 1;
  const elapsedAcademicYears = currentSessionStartYear - admissionYear + 1;

  // Clamp currentAcademicYear to [1, courseDuration]
  const currentAcademicYear = Math.min(Math.max(elapsedAcademicYears, 1), courseDuration);
  const isGraduated = elapsedAcademicYears > courseDuration;

  // Build the list of academic years that must have fee obligations assessed
  const assessedYears = [];
  for (let y = 1; y <= currentAcademicYear; y++) {
    const sessionStart = admissionYear + (y - 1);
    const sessionEnd = sessionStart + 1;
    assessedYears.push({
      academicYear: y,
      academicSession: `${sessionStart}-${String(sessionEnd).slice(-2)}`,
    });
  }

  return {
    status: "RESOLVED",
    admissionYear,
    graduationYear,
    courseDuration,
    currentAcademicYear,
    isGraduated,
    currentSessionLabel: `${currentSessionStartYear}-${String(currentSessionStartYear + 1).slice(-2)}`,
    assessedYears,
    batch: rawBatch,
    academicCalendar: {
      sessionStartMonth: startMonth,
      sessionStartDay: startDay,
      isInstitutionConfigured: Boolean(
        options?.academicCalendar ||
        options?.institution?.academicCalendar ||
        student?.institution?.academicCalendar
      ),
    },
  };
}

module.exports = {
  resolveStudentAcademicProgression,
};
