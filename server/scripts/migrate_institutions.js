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

  // 2. Inspect and safely audit Students
  const students = await Student.find({});
  console.log(`\nFound ${students.length} total Student records.`);

  let studentsDomainMatched = 0;
  let studentsUnassigned = 0;

  for (const student of students) {
    if (student.institutionId) {
      continue;
    }

    // Check for explicit institutional email domains (e.g. @miet.ac.in)
    const email = (student.email || "").toLowerCase();
    let matchedInstId = null;

    if (email.includes("@miet.ac.in")) {
      matchedInstId = collegeMap.get("miet");
    }

    if (matchedInstId) {
      if (isApply) {
        student.institutionId = matchedInstId;
        await student.save();
      }
      studentsDomainMatched++;
      console.log(`[Student Matched] ${student.email} -> linked to MIET (${isApply ? "SAVED" : "DRY RUN"})`);
    } else {
      studentsUnassigned++;
      console.log(`[Student Unassigned] ${student.email} (${student.name}) - Left untouched to prevent improper assignment.`);
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`Institutions: ${institutionsCreated} ${isApply ? "created" : "to create"}`);
  console.log(`Admins updated: ${adminsUpdated}`);
  console.log(`Students matched by domain: ${studentsDomainMatched}`);
  console.log(`Students left unassigned: ${studentsUnassigned}`);

  await mongoose.disconnect();
  console.log(`\nDone. Exiting.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
