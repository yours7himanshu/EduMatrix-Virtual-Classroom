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
    <div className="addTeacher flex w-full"> {/* Removed ml-[30%] */}
     
      <div className="addteachers w-full flex flex-col items-center justify-center p-4"> {/* Changed w-[80%] to w-full, added flex and padding */}
        <TeacherRole />
        {/* Adjusted teachers-section to remove h-screen for natural height, added py for spacing */}
        <div className="teachers-section flex flex-col items-center justify-center gap-5 w-full py-8">
          <form
            className="flex flex-col gap-4 w-full max-w-xl border border-gray-200 shadow-lg p-6 md:p-10 rounded-lg bg-white" // Changed w-[60%], gap, padding and added bg
            onSubmit={handleSubmit}
          >
            <h1 className="text-violet-800 font-semibold mb-4 text-2xl md:text-3xl text-center md:text-left"> {/* Adjusted text size and alignment */}
              Add Teachers of your College to help Students!!
            </h1>

            <input
              type="text"
              placeholder="Faculty Name"
              value={name}
              className="border border-gray-300 h-10 w-full p-2 rounded-md"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <select
              name="qualifications"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="border border-gray-300 h-10 w-full p-2 rounded-md focus:text-black text-gray-400"
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
              className="border border-gray-300 h-10 w-full p-2 rounded-md"
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Generate Teachers Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 h-10 w-full p-2 rounded-md"
              required
            />

            <input
              type="password"
              placeholder="Generate Student Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 h-10 w-full p-2 rounded-md"
              required
            />

            <input
              type="number"
              placeholder="Years of Experience of Faculty in the field"
              value={experience}
              className="border border-gray-300 h-10 w-full p-2 rounded-md"
              onChange={(e) => setExperience(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-10 rounded-md bg-violet-600 text-white font-medium"
            >
              {loading?"Adding Teacher":"Add Teacher"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppLayout()(AddTeacher);
