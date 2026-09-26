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
import { toast } from "react-toastify";
import axios from "axios";
import AppLayout from "../../layout/AppLayout";
import {
  Card,
  CardHeader,
  FormField,
  TextInput,
  Button,
} from "../../shared/ui";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const StudentMarksAttendance = () => {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [marks, setStudentMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/v6/add-student-marks-attendance`,
        {
          RollNumber: rollNo,
          Name: name,
          Marks: marks,
          Attendance: attendance,
          Year: year,
          Section: section,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setRollNo("");
        setName("");
        setStudentMarks("");
        setAttendance("");
        setYear("");
        setSection("");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-admin-slate-50/60 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-3xl">
        <Card padding="default" className="shadow-admin-sm">
          <CardHeader
            title="Student Marks & Attendance"
            subtitle="Record course examination grades and classroom attendance metrics"
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <FormField
                label="Student Full Name"
                id="marks-student-name"
                required
              >
                <TextInput
                  id="marks-student-name"
                  type="text"
                  placeholder="Enter Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Roll Number"
                id="marks-roll-number"
              >
                <TextInput
                  id="marks-roll-number"
                  type="number"
                  placeholder="Enter Student Roll Number"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
              </FormField>

              <FormField
                label="Examination Marks"
                id="marks-student-marks"
                required
                hint="Total score or grade points"
              >
                <TextInput
                  id="marks-student-marks"
                  type="number"
                  placeholder="Enter Student Marks"
                  value={marks}
                  onChange={(e) => setStudentMarks(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Attendance Rate (%)"
                id="marks-attendance"
                required
                hint="Percentage of lectures attended"
              >
                <TextInput
                  id="marks-attendance"
                  type="number"
                  placeholder="Enter Student Attendance"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Academic Year"
                id="marks-student-year"
                required
                hint="e.g., 1, 2, 3, or 4"
              >
                <TextInput
                  id="marks-student-year"
                  type="number"
                  placeholder="Enter Student Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Class Section"
                id="marks-student-section"
                required
                hint="e.g., A, B, or C"
              >
                <TextInput
                  id="marks-student-section"
                  type="text"
                  placeholder="Enter Student Section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="pt-2 border-t border-admin-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
              >
                {loading ? "Recording Student Data..." : "Submit Student Records"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

const WrappedStudentMarksAttendance = AppLayout()(StudentMarksAttendance);
export default WrappedStudentMarksAttendance;