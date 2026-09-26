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

const FeeStructure = require("../models/feeStructureModel");
const mongoose = require("mongoose");

/**
 * Normalizes and validates fee structure lookup parameters.
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.institutionId
 * @param {string} params.branch
 * @param {number|string} params.academicYear
 * @returns {{ institutionId: string, branch: string, academicYear: number }}
 */
function normalizeFeeLookupParams({ institutionId, branch, academicYear }) {
  if (!institutionId) {
    const error = new Error("institutionId is required to look up fee structure");
    error.code = "INVALID_INSTITUTION_ID";
    throw error;
  }

  if (!branch || typeof branch !== "string" || !branch.trim()) {
    const error = new Error("branch is required to look up fee structure");
    error.code = "INVALID_BRANCH";
    throw error;
  }

  const parsedYear = Number(academicYear);
  if (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 4) {
    const error = new Error("academicYear must be an integer between 1 and 4");
    error.code = "INVALID_ACADEMIC_YEAR";
    throw error;
  }

  return {
    institutionId: institutionId.toString(),
    branch: branch.trim().toUpperCase(),
    academicYear: parsedYear,
  };
}

/**
 * Retrieves the authoritative, active FeeStructure for an institution, branch, and academic year.
 * Fails clearly if no authorized active structure exists.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.institutionId
 * @param {string} params.branch
 * @param {number|string} params.academicYear
 * @returns {Promise<Object>} Active FeeStructure document
 */
async function getFeeStructure({ institutionId, branch, academicYear }) {
  const normalized = normalizeFeeLookupParams({
    institutionId,
    branch,
    academicYear,
  });

  const structure = await FeeStructure.findOne({
    institutionId: normalized.institutionId,
    branch: normalized.branch,
    academicYear: normalized.academicYear,
    isActive: true,
  });

  if (!structure) {
    const error = new Error(
      `No active fee structure found for institution: ${normalized.institutionId}, branch: ${normalized.branch}, academicYear: ${normalized.academicYear}`
    );
    error.code = "FEE_STRUCTURE_NOT_FOUND";
    error.details = normalized;
    throw error;
  }

  return structure;
}

module.exports = {
  getFeeStructure,
  normalizeFeeLookupParams,
};
