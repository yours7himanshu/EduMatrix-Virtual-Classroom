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

const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institution",
      required: [true, "institutionId is required"],
      index: true,
    },
    branch: {
      type: String,
      required: [true, "branch is required"],
      trim: true,
      uppercase: true,
    },
    academicYear: {
      type: Number,
      required: [true, "academicYear is required"],
      min: [1, "academicYear must be between 1 and 4"],
      max: [4, "academicYear must be between 1 and 4"],
      validate: {
        validator: Number.isInteger,
        message: "academicYear must be an integer between 1 and 4",
      },
    },
    tuitionFee: {
      type: Number,
      required: [true, "tuitionFee is required"],
      min: [0, "tuitionFee must be a non-negative number"],
      validate: {
        validator: (value) => typeof value === "number" && !isNaN(value) && value >= 0,
        message: "tuitionFee must be a valid non-negative number",
      },
    },
    additionalFee: {
      type: Number,
      default: 0,
      min: [0, "additionalFee must be a non-negative number"],
      validate: {
        validator: (value) => typeof value === "number" && !isNaN(value) && value >= 0,
        message: "additionalFee must be a valid non-negative number",
      },
    },
    components: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    currency: {
      type: String,
      default: "inr",
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound unique index preventing duplicate fee definitions for the same institution, branch, and academic year
feeStructureSchema.index(
  { institutionId: 1, branch: 1, academicYear: 1 },
  { unique: true }
);

// Secondary query index for active structures by institution
feeStructureSchema.index({ institutionId: 1, isActive: 1 });

const FeeStructure = mongoose.model("feeStructure", feeStructureSchema);

module.exports = FeeStructure;
