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

const { resolveStudentFinancialSummary } = require("../services/studentFeeLedgerService");

/**
 * Controller to fetch the authoritative student fee ledger and financial summary.
 * Authenticated via student JWT (req.studentId).
 */
const getStudentFeeLedger = async (req, res) => {
  try {
    const studentId = req.studentId;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing authenticated student identity",
      });
    }

    const summary = await resolveStudentFinancialSummary(studentId);
    return res.status(200).json(summary);
  } catch (error) {
    if (error.code === "STUDENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Student record not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve student fee ledger",
    });
  }
};

module.exports = {
  getStudentFeeLedger,
};
