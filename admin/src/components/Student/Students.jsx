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
import { Avatar, Stack, IconButton } from "@mui/material";
import { VisuallyHiddenInput } from "../styles/StyledComponents";
import { CameraAlt as Camera } from "@mui/icons-material";
import { useFileHandler } from "6pp";
import AppLayout from "../../layout/AppLayout";

function Students() {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [batch, setBatch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Standardized to double quotes
  const avatar = useFileHandler("single");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("branch", branch);
    formData.append("batch", batch);
    formData.append("rollNo", rollNo);
    formData.append("fatherName", fatherName);
    formData.append("phoneNo", phoneNo);
    formData.append("email", email);
    formData.append("password", password);
    if (avatar.file) {
      formData.append("avatar", avatar.file);
      console.log(avatar.file);
    } else {
      console.log("avatar file is not present");
    }

    try {
      const response = await axios.post(`${backendUrl}/api/v5/enroll-student`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Student Enrolled Successfully");
      }
    } catch (error) {
      console.error("Error enrolling student:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Some unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed ml-[19%] from the inner div, adjusted padding and removed fixed height h-[80%]
    // The outer div already has min-h-screen. The AppLayout provides the main structure.
    <div className="w-full bg-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto"> {/* This div centers the content below it */}
          <h1 className="text-2xl md:text-3xl font-bold text-violet-700 text-center mb-6 md:mb-8">
            Enroll Students
          </h1>

          <form className="bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
            <div className="flex justify-center mb-6">
              <Stack position="relative" width="10rem" alignItems="center">
                <Avatar
                  sx={{
                    width: "10rem",
                    height: "10rem",
                    objectFit: "cover",
                  }}
                  src={avatar.preview}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    color: "white",
                    bgcolor: "rgba(0,0,0,0.5)",
                    ":hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                  component="label"
                >
                  <VisuallyHiddenInput type="file" onChange={avatar.changeHandler} />
                  <Camera />
                </IconButton>
              </Stack>
            </div>

            {/* Ensured consistent gap and mb for form elements */}
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                required
              />
              <input
                type="number"
                placeholder="Student Roll No"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                required
              />
              <input
                type="text"
                placeholder="Enters Student Father's Name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                required
              />
              <input
                type="number"
                placeholder="Enter Student Phone Number"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                required
              />
              <input
                type="email"
                placeholder="Generate Student College Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                required
              />
              <input
                type="password"
                placeholder="Generate Student Account Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                required
              />
            </div>

            {/* Consistent mt for this grid section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-4">
              <select
                name="studentBranch"
                id="studentBranch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 transition duration-200"
                required
              >
                <option value="Branch">Choose Student Branch</option> {/* Standardized to double quotes */}
                <option value="CSE">CSE</option> {/* Standardized to double quotes */}
                <option value="CSE AI">CSE AI</option> {/* Standardized to double quotes */}
                <option value="CSE IOT">CSE IOT</option> {/* Standardized to double quotes */}
                <option value="CSE DATASCIENCE">CSE DATASCIENCE</option> {/* Standardized to double quotes */}
                <option value="Mechanical Engineering">Mechanical Engineering</option> {/* Standardized to double quotes */}
                <option value="Chemical Engineering">Chemical Engineering</option> {/* Standardized to double quotes */}
                <option value="Electronics Engineering">Electronics Engineering</option> {/* Standardized to double quotes */}
              </select>

              <select
                name="year"
                id="studentYear"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 transition duration-200"
                required
              >
                <option value="choose student year">Choose Student Batch</option> {/* Standardized to double quotes */}
                <option value="2017-2021">2017-2021</option> {/* Standardized to double quotes */}
                <option value="2018-2022">2018-2022</option> {/* Standardized to double quotes */}
                <option value="2019-2023">2019-2023</option> {/* Standardized to double quotes */}
                <option value="2020-2024">2020-2024</option> {/* Standardized to double quotes */}
                <option value="2021-2025">2021-2025</option> {/* Standardized to double quotes */}
                <option value="2022-2026">2022-2026</option> {/* Standardized to double quotes */}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-violet-600 text-white font-semibold text-lg rounded-md hover:bg-violet-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              {loading ? "Enrolling Student Please Wait..." : "Enroll Student"}
            </button>
          </form>
        </div>
      </div>
    
  );
}

export default AppLayout()(Students);
