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

const enrollmentSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "classroom",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["enrolled", "dropped"],
      default: "enrolled",
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    droppedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment for the same student in the same classroom
enrollmentSchema.index({ classroomId: 1, studentId: 1 }, { unique: true });

// Optimize lookups for a student's active enrollments
enrollmentSchema.index({ studentId: 1, status: 1 });

const Enrollment = mongoose.models.enrollment || mongoose.model("enrollment", enrollmentSchema);

module.exports = Enrollment;
