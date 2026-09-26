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

const studentFeeAccountSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institution",
      required: [true, "institutionId is required"],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: [true, "studentId is required"],
      index: true,
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
    academicSession: {
      type: String,
      trim: true,
      default: "",
    },
    branch: {
      type: String,
      required: [true, "branch is required"],
      trim: true,
      uppercase: true,
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "feeStructure",
      required: false,
    },
    currency: {
      type: String,
      default: "inr",
      trim: true,
      lowercase: true,
    },
    components: [
      {
        code: { type: String, required: true },
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    totalAssessed: {
      type: Number,
      required: [true, "totalAssessed is required"],
      min: [0, "totalAssessed must be non-negative"],
    },
    concessions: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    netAssessed: {
      type: Number,
      required: [true, "netAssessed is required"],
      min: [0, "netAssessed must be non-negative"],
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, "totalPaid must be non-negative"],
    },
    outstandingBalance: {
      type: Number,
      required: [true, "outstandingBalance is required"],
      min: [0, "outstandingBalance must be non-negative"],
    },
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid"],
      default: "unpaid",
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring exactly one account per student per academic year at an institution
studentFeeAccountSchema.index(
  { institutionId: 1, studentId: 1, academicYear: 1 },
  { unique: true }
);

// Secondary index for institution-wide financial reporting
studentFeeAccountSchema.index({ institutionId: 1, status: 1 });
studentFeeAccountSchema.index({ studentId: 1, academicYear: 1 });

const StudentFeeAccount = mongoose.model("studentFeeAccount", studentFeeAccountSchema);

module.exports = StudentFeeAccount;
