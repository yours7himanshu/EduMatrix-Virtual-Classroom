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

import { useState } from "react";
import AppLayout from "../layout/AppLayout";
import {
  Card,
  CardHeader,
  Select,
  Badge,
} from "../shared/ui";

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
};

const TimeTable = () => {
  const [selectedClass, setSelectedClass] = useState("class1");

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM"];

  return (
    <div className="w-full min-h-screen bg-admin-slate-50/60 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-6xl">
        <Card padding="default" className="shadow-admin-sm">
          <CardHeader
            title="Weekly Class Timetable"
            subtitle="View academic schedules and lecture allocations across weekday time slots"
            action={
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label
                  htmlFor="timetable-class-select"
                  className="text-xs font-semibold text-admin-slate-600 uppercase tracking-wider shrink-0"
                >
                  Class:
                </label>
                <div className="w-36">
                  <Select
                    id="timetable-class-select"
                    value={selectedClass}
                    onChange={handleClassChange}
                    className="h-9 py-1 text-xs sm:text-sm font-medium"
                  >
                    <option value="class1">Class 1</option>
                    <option value="class2">Class 2</option>
                  </Select>
                </div>
              </div>
            }
          />

          {/* Mobile Swipe Guidance Badge */}
          <div className="md:hidden flex justify-center mb-3">
            <Badge tone="brand" size="sm">
              👈 Swipe horizontally to view days 👉
            </Badge>
          </div>

          {/* Timetable Grid Display */}
          <div className="overflow-x-auto rounded-xl border border-admin-slate-200/80 bg-white shadow-admin-xs">
            <div className="timetable-grid grid grid-cols-6 gap-2 sm:gap-3 min-w-[680px] p-3 sm:p-4">
              {/* Header Cells */}
              <div className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-admin-slate-600 p-2.5 sm:p-3 bg-admin-slate-50/90 rounded-lg text-center border-b border-admin-slate-200">
                Time
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="font-semibold text-xs sm:text-sm uppercase tracking-wider text-admin-slate-600 p-2.5 sm:p-3 bg-admin-slate-50/90 rounded-lg text-center border-b border-admin-slate-200"
                >
                  {day}
                </div>
              ))}

              {/* Time Slots & Class Rows */}
              {timeSlots.map((time, slotIdx) => (
                <div key={time} className="contents">
                  <div className="text-admin-slate-800 p-2 sm:p-3 font-semibold text-xs sm:text-sm flex items-center justify-center bg-admin-slate-50/70 rounded-xl border border-admin-slate-200/80">
                    {time}
                  </div>
                  {days.map((day) => {
                    const subject =
                      timetableData[selectedClass]?.[day]?.[slotIdx] ||
                      "No Class";
                    const isNoClass = subject === "No Class";

                    return (
                      <div
                        key={`${day}-${slotIdx}`}
                        className={`p-2 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center min-h-[44px] transition-colors duration-150 text-center ${
                          isNoClass
                            ? "bg-admin-slate-50/40 border-admin-slate-100 text-admin-slate-400 italic"
                            : "bg-white border-admin-slate-200/80 text-admin-slate-800 shadow-admin-xs hover:bg-admin-brand-50/40 hover:border-admin-brand-200"
                        }`}
                      >
                        {subject}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const WrappedTimeTable = AppLayout()(TimeTable);
export default WrappedTimeTable;
