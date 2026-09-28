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

const classroomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institution",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure courseCode is unique per institution
classroomSchema.index({ institutionId: 1, courseCode: 1 }, { unique: true });

// Optimize common query patterns
classroomSchema.index({ institutionId: 1, teacherId: 1 });
classroomSchema.index({ institutionId: 1, branch: 1, batch: 1 });

const Classroom = mongoose.models.classroom || mongoose.model("classroom", classroomSchema);

module.exports = Classroom;
