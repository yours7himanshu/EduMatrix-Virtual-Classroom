
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

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    
  },
  description: {
    type: String,
    required: true,
  },
  questions: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true,
  },
});

const Assignment = mongoose.model("assignment", assignmentSchema);
module.exports = Assignment;
