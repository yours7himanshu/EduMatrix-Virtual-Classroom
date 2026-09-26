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



import React, { useState } from "react";
import AppLayout from "../layout/AppLayout";
// import Sidebar from "./Sidebar";

// Sample data for timetables
const timetableData = {
  class1: {
    Monday: ["Math", "English", "Science", "History"],
    Tuesday: ["Math", "Geography", "PE", "Arts"],
    Wednesday: ["English", "Science", "Math", "History"],
    Thursday: ["Math", "PE", "Geography", "Arts"],
    Friday: ["History", "Science", "Math", "English"],
  },
  class2: {
    Monday: ["Biology", "Math", "Chemistry", "Literature"],
    Tuesday: ["Physics", "Math", "Chemistry", "Computer Science"],
    Wednesday: ["Biology", "Literature", "Math", "History"],
    Thursday: ["Physics", "Chemistry", "Literature", "Computer Science"],
    Friday: ["Math", "History", "Biology", "Chemistry"],
  },
  // Add more classes as needed
};

const TimeTable = () => {
  const [selectedClass, setSelectedClass] = useState("class1");

  // Handler to update selected class
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  return (
    <div className="time-table-page w-full min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header */}
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 tracking-tight">
          Select a Class to View the Timetable
        </h1>

        {/* Class Selection Dropdown */}
        <div className="mb-4 sm:mb-6">
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="border border-gray-300 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 shadow-xs font-medium"
          >
            <option value="class1">Class 1</option>
            <option value="class2">Class 2</option>
          </select>
        </div>

        {/* Mobile Swipe Guidance Badge */}
        <div className="md:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 py-1.5 px-3.5 rounded-full mb-3">
          👈 Swipe horizontally to view days 👉
        </div>

        {/* Timetable Display */}
        <div className="overflow-x-auto py-2 rounded-2xl bg-white shadow-xs border border-gray-200">
          <div className="timetable-grid grid grid-cols-6 gap-2 sm:gap-3 min-w-[680px] p-3 sm:p-4">
            {/* Header Cells with responsive padding and text size */}
            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-700 p-2 sm:p-3 bg-gray-100/70 rounded-xl">Time</div>
            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-700 p-2 sm:p-3 bg-gray-100/70 rounded-xl">Monday</div>
            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-700 p-2 sm:p-3 bg-gray-100/70 rounded-xl">Tuesday</div>
            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-700 p-2 sm:p-3 bg-gray-100/70 rounded-xl">Wednesday</div>
            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-700 p-2 sm:p-3 bg-gray-100/70 rounded-xl">Thursday</div>
            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-700 p-2 sm:p-3 bg-gray-100/70 rounded-xl">Friday</div>

            {/* Time slots */}
            {["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM"].map((time, index) => (
              <React.Fragment key={index}>
                <div className="text-gray-800 p-2 sm:p-3 font-semibold text-xs sm:text-sm flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">{time}</div>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                  (day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="p-2 sm:p-3 bg-white border border-gray-100 rounded-xl shadow-xs hover:bg-violet-50/70 hover:border-violet-200 transition duration-200 text-xs sm:text-sm font-medium text-gray-700 flex items-center justify-center min-h-[44px]"
                    >
                      {timetableData[selectedClass][day][index] || "No Class"}
                    </div>
                  )
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout()(TimeTable);
