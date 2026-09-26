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
        const token = localStorage.getItem("token");
        const response = await axios.get(`${backendUrl}/api/v5/student-detail`, {
          headers: { token: token || "" },
        });
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
    <div className="w-full min-h-screen bg-gray-50 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 tracking-tight">
          Student Directory
        </h1>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {students.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-gray-500 border border-gray-100 shadow-xs">
              No students found
            </div>
          ) : (
            students.map((student, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-start gap-3.5 transition hover:shadow-sm"
              >
                <img
                  src={student.avatar}
                  className="h-14 w-14 shrink-0 object-cover rounded-xl border border-gray-100 shadow-xs"
                  alt={`${student.name}'s photo`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{student.name}</h4>
                    <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100">
                      Roll {student.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    {student.branch} · Batch {student.batch}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">{student.email}</p>
                  {student.phoneNo && (
                    <p className="text-xs text-gray-400 mt-0.5">Ph: {student.phoneNo}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-2xl shadow-xs border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-violet-800 text-white text-left">
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Phone No</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Father Name</th>
                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    } hover:bg-violet-50/50 transition-colors`}
                  >
                    <td className="px-6 py-3">
                      <img
                        src={student.avatar}
                        className="h-12 w-12 object-cover rounded-xl shadow-xs border border-gray-100"
                        alt={`${student.name}'s photo`}
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-gray-600">{student.phoneNo}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{student.rollNo}</td>
                    <td className="px-6 py-4 text-gray-600">{student.batch}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{student.branch}</td>
                    <td className="px-6 py-4 text-gray-600">{student.fatherName}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{student.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
