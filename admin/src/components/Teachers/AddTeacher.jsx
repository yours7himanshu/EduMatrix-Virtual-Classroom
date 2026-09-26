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

function AddTeacher() {
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState("");
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading,setLoading]=useState("");
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
        password
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
    }
    finally{
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        <TeacherRole />

        <div className="flex flex-col items-center justify-center gap-5 w-full py-6 sm:py-8">
          <form
            className="flex flex-col gap-4 w-full max-w-xl border border-gray-100 shadow-xl p-4 sm:p-8 rounded-2xl bg-white"
            onSubmit={handleSubmit}
          >
            <h1 className="text-violet-800 font-bold mb-2 text-xl sm:text-2xl md:text-3xl text-center sm:text-left tracking-tight">
              Add Teachers of your College to help Students!!
            </h1>

            <input
              type="text"
              placeholder="Faculty Name"
              value={name}
              className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition shadow-xs"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <select
              name="qualifications"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl focus:text-black text-gray-500 outline-none focus:ring-2 focus:ring-violet-500 transition shadow-xs"
              id="qualifications"
            >
              <option value="choose">Choose your Qualification</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Sc">M.Sc</option>
              <option value="P.hd">P.hd</option>
              <option value="B.Sc">B.Sc</option>
            </select>

            <input
              type="text"
              placeholder="Faculty Subject"
              value={subject}
              className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition shadow-xs"
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Generate Teachers Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition shadow-xs"
              required
            />

            <input
              type="password"
              placeholder="Generate Faculty Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition shadow-xs"
              required
            />

            <input
              type="number"
              placeholder="Years of Experience of Faculty in the field"
              value={experience}
              className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl outline-none focus:ring-2 focus:ring-violet-500 transition shadow-xs"
              onChange={(e) => setExperience(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md hover:shadow-lg transition focus:outline-none disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Adding Teacher..." : "Add Teacher"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppLayout()(AddTeacher);
