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
    <div className="w-full my-2">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {teachers.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl text-center text-gray-500 border border-gray-100 shadow-xs">
            No teachers registered yet
          </div>
        ) : (
          teachers.map((teacher, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col gap-2 transition hover:shadow-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-gray-900 text-base">{teacher.name}</h4>
                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-100">
                  {teacher.experience} yrs exp
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 flex flex-col gap-1.5 pt-1 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Subject</span>
                  <span className="font-semibold text-gray-800">{teacher.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Qualification</span>
                  <span className="text-gray-700">{teacher.qualification}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xs border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-violet-800 text-white text-left">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Teacher Name</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Qualifications</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Experience</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No teachers registered yet
                </td>
              </tr>
            ) : (
              teachers.map((teacher, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } hover:bg-violet-50/50 transition-colors`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-gray-600">{teacher.qualification}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{teacher.subject}</td>
                  <td className="px-6 py-4 text-gray-600">{teacher.experience} years</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Teachers;
