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

const express = require("express");
const router = express.Router();
const isAdminAuthenticated = require("../middlewares/adminAuth");
const {
  getAdminFeeStructures,
  getAdminFeeStructureById,
  createOrUpdateFeeStructure,
  updateFeeStructureById,
  toggleFeeStructureStatus,
  deleteFeeStructure,
} = require("../controllers/adminFeeStructureController");

// All routes are strictly protected by admin authentication
router.use(isAdminAuthenticated);

// GET /api/v10/admin/fee-structures - List institutional fee structures
router.get("/fee-structures", getAdminFeeStructures);

// GET /api/v10/admin/fee-structures/:id - Get a single institutional fee structure by ID
router.get("/fee-structures/:id", getAdminFeeStructureById);

// POST /api/v10/admin/fee-structures - Create or update (upsert) a fee structure
router.post("/fee-structures", createOrUpdateFeeStructure);

// PUT /api/v10/admin/fee-structures/:id - Update an existing fee structure by ID
router.put("/fee-structures/:id", updateFeeStructureById);

// PATCH /api/v10/admin/fee-structures/:id/toggle-active - Toggle active status
router.patch("/fee-structures/:id/toggle-active", toggleFeeStructureStatus);

// DELETE /api/v10/admin/fee-structures/:id - Delete a fee structure
router.delete("/fee-structures/:id", deleteFeeStructure);

module.exports = router;
