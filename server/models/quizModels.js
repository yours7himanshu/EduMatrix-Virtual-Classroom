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

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [String],
        correctAnswer: { type: Number, required: true },
      },
    ],
    // Tenant binding — set server-side from the authenticated user; never from client input.
    institutionId: { type: String, required: true, index: true },
    // Audit: which admin created this quiz.
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Compound index for deterministic, tenant-scoped cursor pagination
quizSchema.index({ institutionId: 1, createdAt: 1, _id: 1 });

const Quiz = mongoose.models.quiz || mongoose.model("quiz", quizSchema);
module.exports = Quiz;
