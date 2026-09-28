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

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    centerCode: {
      type: Number,
      required: true,
      index: true,
    },
    academicCalendar: {
      sessionStartMonth: {
        type: Number,
        default: 7,
        min: 1,
        max: 12,
      },
      sessionStartDay: {
        type: Number,
        default: 1,
        min: 1,
        max: 31,
      },
    },
  },
  { timestamps: true }
);

const Institution = mongoose.models.institution || mongoose.model("institution", institutionSchema);

module.exports = Institution;
