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
import { useEffect, useState } from "react";
import axios from "axios";

function StudentDetail() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/v5/student-detail`);
        if (response.data.success) {
          setStudents(response.data.studentdetails);
        }
      } catch (error) {
        console.log("Error fetching the student details", error);
      }
    };
    fetchStudents();
  });

  return (
    <div className="container my-1 px-4 py-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-violet-800 text-white text-left">
              <th className="px-6 py-3 text-sm font-semibold">Photo</th>
              <th className="px-6 py-3 text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-sm font-semibold hidden sm:table-cell">Phone No</th>
              <th className="px-6 py-3 text-sm font-semibold">Roll No</th>
              <th className="px-6 py-3 text-sm font-semibold">Batch</th>
              <th className="px-6 py-3 text-sm font-semibold">Branch</th>
              <th className="px-6 py-3 text-sm font-semibold hidden sm:table-cell">Father Name</th>
              <th className="px-6 py-3 text-sm font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                } hover:bg-gray-200 transition-colors`}
              >
                <td className="px-6 py-4">
                  <img
                    src={student.avatar}
                    className="h-16 w-16 object-cover rounded-md" // Adjusted size
                    alt={`${student.name}'s photo`}
                  />
                </td>
                <td className="px-6 py-4 text-gray-700 align-middle">{student.name}</td>
                <td className="px-6 py-4 text-gray-700 align-middle hidden sm:table-cell">{student.phoneNo}</td>
                <td className="px-6 py-4 text-gray-700 align-middle">{student.rollNo}</td>
                <td className="px-6 py-4 text-gray-700 align-middle">{student.batch}</td>
                <td className="px-6 py-4 text-gray-700 align-middle">{student.branch}</td>
                <td className="px-6 py-4 text-gray-700 align-middle hidden sm:table-cell">
                  {student.fatherName}
                </td>
                <td className="px-6 py-4 text-gray-700 align-middle">{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentDetail;
