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
import scholar from "../assets/scholar.png";
import axios from "axios";
import { toast } from "react-toastify";
import AppLayout from "../layout/AppLayout";
import {
  Card,
  CardHeader,
  FormField,
  TextInput,
  Select,
  Textarea,
  Button,
} from "../shared/ui";

const Announcement = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/v3/announcement`, {
        category,
        course,
        branch,
        description,
      });
      if (response.data.success) {
        toast.success("Assignment posted Successful");
      }
    } catch (error) {
      console.log("Error posting assignments", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Some unexpected error occured");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    setCategory("");
    setDescription("");
    setBranch("");
    setCourse("");
  };

  return (
    <div className="w-full min-h-screen bg-admin-slate-50/60 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl">
        <Card padding="default" className="shadow-admin-sm">
          <CardHeader
            title="Post College Announcement"
            subtitle="Publish campus notices, exam schedules, and academic bulletins"
            action={
              <div className="flex items-center gap-2 p-2 rounded-xl bg-admin-brand-50 border border-admin-brand-100/60 shrink-0">
                <img
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  src={scholar}
                  alt="Scholar badge"
                />
              </div>
            }
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              label="Announcement Category"
              id="announcement-category"
              required
            >
              <Select
                id="announcement-category"
                name="announcement category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Choose Category</option>
                <option value="Exams">Exams</option>
                <option value="Timetables">Timetables</option>
                <option value="Course Schedules">Course Schedules</option>
                <option value="Results">Results</option>
                <option value="Cultural and Sports ">Cultural and Sports </option>
                <option value="Grades">Grades</option>
                <option value="Academic Calendar">Academic Calendar</option>
                <option value="Assignments and Deadlines">
                  Assignments and Deadlines
                </option>
                <option value="Workshops and Seminars">
                  Workshops and Seminars
                </option>
                <option value="Suggestions">Suggestions</option>
              </Select>
            </FormField>

            <FormField
              label="Course / Target Department"
              id="announcement-course"
              required
            >
              <Select
                id="announcement-course"
                name="studentCourse"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                <option value="">Choose Course For Announcement</option>
                <option value="CSE">CSE</option>
                <option value="CSE AI">CSE AI</option>
                <option value="CSE IOT">CSE IOT</option>
                <option value="CSE DATASCIENCE">CSE DATASCIENCE</option>
                <option value="Mechanical Engineering">
                  Mechanical Engineering
                </option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Electronics Engineering">
                  Electronics Engineering
                </option>
                <option value="All Departments">All Departments</option>
              </Select>
            </FormField>

            <FormField
              label="Announcement Title"
              id="announcement-title"
              required
            >
              <TextInput
                id="announcement-title"
                type="text"
                placeholder="e.g., Mid-Term Examination Datesheet"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              />
            </FormField>

            <FormField
              label="Announcement Description"
              id="announcement-description"
              required
              hint="Provide full details, schedules, instructions, or deadlines for recipients"
            >
              <Textarea
                id="announcement-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the complete announcement details here..."
                rows={5}
                required
              />
            </FormField>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-admin-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full sm:flex-1"
              >
                {loading ? "Posting Announcement..." : "Post Announcement"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleClick}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Clear Form
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

const WrappedAnnouncement = AppLayout()(Announcement);
export default WrappedAnnouncement;
