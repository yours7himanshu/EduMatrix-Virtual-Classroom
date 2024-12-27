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
    <div className="time-table-page w-[70%] ml-[25%] min-h-screen bg-gray-50 py-12 px-6">
      <div className="container mx-auto text-center">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Select a Class to View the Timetable
        </h1>

        {/* Class Selection Dropdown */}
        <div className="mb-8">
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="border border-gray-300 rounded-lg p-3 text-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-600"
          >
            <option value="class1">Class 1</option>
            <option value="class2">Class 2</option>
            {/* Add more options for other classes */}
          </select>
        </div>

        {/* Timetable Display */}
        <div className="timetable-grid grid grid-cols-6 gap-4">
          <div className="font-semibold text-xl text-gray-800 p-4">Time</div>
          <div className="font-semibold text-xl text-gray-800 p-4">Monday</div>
          <div className="font-semibold text-xl text-gray-800 p-4">Tuesday</div>
          <div className="font-semibold text-xl text-gray-800 p-4">
            Wednesday
          </div>
          <div className="font-semibold text-xl text-gray-800 p-4">
            Thursday
          </div>
          <div className="font-semibold text-xl text-gray-800 p-4">Friday</div>

          {/* Time slots */}
          {["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM"].map((time, index) => (
            <React.Fragment key={index}>
              <div className="text-gray-700 p-4 font-medium">{time}</div>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="p-4 bg-white border rounded-lg shadow-sm hover:bg-violet-100 transition duration-300 ease-in-out"
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
  );
};

export default AppLayout()(TimeTable);
