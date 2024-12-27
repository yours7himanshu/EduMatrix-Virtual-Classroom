
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

import React from "react";

// Importing an image of a teacher for the visual
import teacherImage from "../../assets/teacher-image.jpg"; // Adjust path as necessary

const TeacherRole = () => {
  return (
    <div className="teacher-role bg-gray-50 py-12 px-6 lg:px-20 rounded-xl shadow-lg mt-10">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Image Section */}
        <div className="image-section w-full md:w-1/2 rounded-lg overflow-hidden">
          <img
            src={teacherImage}
            alt="Teacher guiding students"
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Message Section */}
        <div className="message-section w-full md:w-1/2 text-center md:text-left">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Teachers: The Architects of Better Education
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Teachers are the cornerstone of a brighter future. They shape young
            minds, instill a love of learning, and inspire greatness in every
            student. Through dedication, patience, and passion, they help mold
            the leaders of tomorrow. Your role as a teacher extends far beyond
            the classroom – you're building a better world, one lesson at a
            time.
          </p>
          <p className="text-gray-500 italic">
            "A good teacher can inspire hope, ignite the imagination, and
            instill a love of learning." – Brad Henry
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherRole;
