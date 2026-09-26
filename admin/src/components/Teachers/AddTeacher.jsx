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
import axios from "axios";
import { toast } from "react-toastify";
import TeacherRole from "./TeacherRole";
import AppLayout from "../../layout/AppLayout";
import {
  Card,
  CardHeader,
  FormField,
  TextInput,
  Select,
  Button,
} from "../../shared/ui";

function AddTeacher() {
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/v4/add-teacher`, {
        name,
        qualification,
        subject,
        experience,
        email,
        password,
      });

      if (response.data.success) {
        toast.success("Faculty Successfully added");
      }
    } catch (error) {
      console.log("Error occured on adding the teachers", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Some unexpected error occured");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-admin-slate-50/60 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-6 sm:gap-8">
        <TeacherRole />

        <div className="w-full max-w-xl">
          <Card padding="default" className="shadow-admin-sm">
            <CardHeader
              title="Add College Faculty"
              subtitle="Register instructors and professors to mentor students"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Faculty Full Name"
                id="faculty-name"
                required
              >
                <TextInput
                  id="faculty-name"
                  type="text"
                  placeholder="e.g., Dr. Rajesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Academic Qualification"
                id="faculty-qualification"
                required
              >
                <Select
                  id="faculty-qualification"
                  name="qualifications"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  required
                >
                  <option value="">Choose your Qualification</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="P.hd">P.hd</option>
                  <option value="B.Sc">B.Sc</option>
                </Select>
              </FormField>

              <FormField
                label="Primary Subject / Department"
                id="faculty-subject"
                required
              >
                <TextInput
                  id="faculty-subject"
                  type="text"
                  placeholder="e.g., Data Structures & Algorithms"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Faculty Institutional Email"
                id="faculty-email"
                required
                hint="Used by faculty to sign in to EduMatrix"
              >
                <TextInput
                  id="faculty-email"
                  type="email"
                  placeholder="faculty@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Initial Faculty Password"
                id="faculty-password"
                required
                hint="Temporary password for initial portal access"
              >
                <TextInput
                  id="faculty-password"
                  type="password"
                  placeholder="Generate Faculty Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Years of Experience"
                id="faculty-experience"
                required
              >
                <TextInput
                  id="faculty-experience"
                  type="number"
                  placeholder="e.g., 5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </FormField>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  className="w-full"
                >
                  {loading ? "Adding Faculty Member..." : "Add Teacher"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

const WrappedAddTeacher = AppLayout()(AddTeacher);
export default WrappedAddTeacher;
