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
 * Migration Script: Migrate Institutions & Identity Links
 * Usage:
 *   node scripts/migrate_institutions.js [--apply]
 * Defaults to dry-run unless --apply is specified.
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Admin = require("../models/adminModels");
const Institution = require("../models/institutionModel");
const Student = require("../models/studentModels");
const Classroom = require("../models/classroomModel");
const Enrollment = require("../models/enrollmentModel");
const { classifyStudentInstitution } = require("../services/legacyInstitutionMigrationService");

const isApply = process.argv.includes("--apply");

async function migrate() {
  console.log(`=== Migration: Institution & Identity Setup (${isApply ? "APPLY MODE" : "DRY RUN"}) ===\n`);

  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is missing from environment variables.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  // 1. Group Admins by collegeName to create/link Institutions
  const admins = await Admin.find({});
  console.log(`Found ${admins.length} total Admin records.`);

  const collegeMap = new Map(); // collegeName (lowercase) -> Institution._id

  // Existing institutions
  const existingInstitutions = await Institution.find({});
  existingInstitutions.forEach((inst) => {
    collegeMap.set(inst.name.trim().toLowerCase(), inst._id);
  });

  let institutionsCreated = 0;
  let adminsUpdated = 0;

  for (const admin of admins) {
    const rawCollegeName = (admin.collegeName || "").trim();
    if (!rawCollegeName) continue;
    const key = rawCollegeName.toLowerCase();

    let instId = collegeMap.get(key);
    if (!instId) {
      if (isApply) {
        const newInst = await Institution.create({
          name: rawCollegeName,
          centerCode: Number(admin.centerCode) || 0,
        });
        instId = newInst._id;
      } else {
        instId = new mongoose.Types.ObjectId();
      }
      collegeMap.set(key, instId);
      institutionsCreated++;
      console.log(`[Institution] ${isApply ? "Created" : "Would create"} institution: '${rawCollegeName}' (centerCode: ${admin.centerCode})`);
    }

    if (!admin.institutionId) {
      if (isApply) {
        admin.institutionId = instId;
        await admin.save();
      }
      adminsUpdated++;
    }
  }

  console.log(`\n[Admins] ${adminsUpdated} Admin accounts ${isApply ? "linked" : "would be linked"} to institutions.`);
  console.log(`[Institutions] ${institutionsCreated} new institutions ${isApply ? "created" : "identified for creation"}.`);

  // 2. Inspect and safely audit Students using Authoritative Evidence Hierarchy
  // STRICT RULE: Email domains (including @miet.ac.in or any domain) are NON-AUTHORITATIVE
  // and MUST NEVER be used to guess or assign a student's institution.
  const students = await Student.find({});
  const allInstitutions = await Institution.find({});
  const classrooms = await Classroom.find({});
  const enrollments = await Enrollment.find({});

  console.log(`\nFound ${students.length} total Student records.`);

  let studentsPreserved = 0;
  let studentsEnrollmentMatched = 0;
  let studentsRequiresAssignment = 0;

  for (const student of students) {
    const classification = classifyStudentInstitution(student, {
      institutions: allInstitutions,
      classrooms,
      enrollments,
    });

    if (classification.status === "PRESERVED") {
      studentsPreserved++;
      console.log(`[Student Preserved] ${student.email} -> already bound to institution ${student.institutionId}`);
    } else if (classification.status === "AUTHORITATIVE_ENROLLMENT_MATCH") {
      if (isApply) {
        student.institutionId = classification.institutionId;
        await student.save();
      }
      studentsEnrollmentMatched++;
      console.log(`[Student Enrollment Match] ${student.email} -> linked to institution ${classification.institutionId} via classroom enrollment (${isApply ? "SAVED" : "DRY RUN"})`);
    } else {
      // REQUIRES_INSTITUTION_ASSIGNMENT
      studentsRequiresAssignment++;
      console.log(`[Student Requires Assignment] ${student.email} (${student.name || "N/A"}) - Left unassigned. (${classification.reason})`);
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`Institutions: ${institutionsCreated} ${isApply ? "created" : "to create"}`);
  console.log(`Admins updated: ${adminsUpdated}`);
  console.log(`Students preserved (already valid): ${studentsPreserved}`);
  console.log(`Students matched by authoritative enrollment: ${studentsEnrollmentMatched}`);
  console.log(`Students requiring institution assignment: ${studentsRequiresAssignment}`);

  await mongoose.disconnect();
  console.log(`\nDone. Exiting.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
