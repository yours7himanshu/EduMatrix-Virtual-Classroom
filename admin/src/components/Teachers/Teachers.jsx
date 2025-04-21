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

import axios from "axios";
import React, { useEffect, useState } from "react";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/v4/teacher-detail`,
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setTeachers(response.data.teacherDetail);
        }
      } catch (error) {
        console.log("Some error occurred", error);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="container my-1 px-4 py-8 max-md:hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-violet-800 text-white text-left">
              <th className="px-6 py-3 text-sm font-semibold">Teacher Name</th>
              <th className="px-6 py-3 text-sm font-semibold">
                Qualifications
              </th>
              <th className="px-6 py-3 text-sm font-semibold">Subject</th>
              <th className="px-6 py-3 text-sm font-semibold">Experience</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                } hover:bg-gray-200 transition-colors`}
              >
                <td className="px-6 py-4 text-gray-700">{teacher.name}</td>
                <td className="px-6 py-4 text-gray-700">
                  {teacher.qualification}
                </td>
                <td className="px-6 py-4 text-gray-700">{teacher.subject}</td>
                <td className="px-6 py-4 text-gray-700">
                  {teacher.experience} years
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Teachers;
