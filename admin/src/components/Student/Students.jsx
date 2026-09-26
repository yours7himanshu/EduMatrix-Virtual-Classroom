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

import { useState, useEffect } from "react";

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

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/classrooms`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            token: token || "",
          },
          withCredentials: true,
        });
        if (res.data?.success && Array.isArray(res.data.classrooms)) {
          setClassrooms(res.data.classrooms);
          if (res.data.classrooms.length > 0) {
            setSelectedClassroomId(res.data.classrooms[0]._id);
          }
        }
      } catch (err) {
        console.warn("Could not fetch classrooms for enrollment dropdown:", err.message);
      }
    };
    fetchClassrooms();
  }, [backendUrl]);

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
        const newStudent = response.data.student;
        if (selectedClassroomId && newStudent?._id) {
          try {
            const token = localStorage.getItem("token");
            await axios.post(
              `${backendUrl}/api/classrooms/${selectedClassroomId}/enrollments`,
              { studentId: newStudent._id },
              {
                headers: {
                  Authorization: token ? `Bearer ${token}` : "",
                  token: token || "",
                },
                withCredentials: true,
              }
            );
            toast.success("Student Registered & Enrolled in Classroom Successfully!");
          } catch (enrollErr) {
            toast.warn(
              `Student registered, but classroom assignment failed: ${
                enrollErr.response?.data?.message || enrollErr.message
              }`
            );
          }
        } else {
          toast.success("Student Enrolled in College Successfully");
        }

        setName("");
        setRollNo("");
        setFatherName("");
        setPhoneNo("");
        setEmail("");
        setPassword("");
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
    <div className="w-full min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-violet-700 text-center mb-6 tracking-tight">
            Enroll Students
          </h1>

          <form className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl border border-gray-100" onSubmit={handleSubmit}>
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

            {/* Form inputs */}
            <div className="flex flex-col gap-3.5">
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs"
                required
              />
              <input
                type="number"
                placeholder="Student Roll No"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs"
                required
              />
              <input
                type="text"
                placeholder="Enter Student Father's Name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs"
                required
              />
              <input
                type="number"
                placeholder="Enter Student Phone Number"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs"
                required
              />
              <input
                type="email"
                placeholder="Generate Student College Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs"
                required
              />
              <input
                type="password"
                placeholder="Generate Student Account Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs"
                required
              />
            </div>

            {/* Dropdown selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
              <select
                name="studentBranch"
                id="studentBranch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs bg-white"
                required
              >
                <option value="Branch">Choose Student Branch</option>
                <option value="CSE">CSE</option>
                <option value="CSE AI">CSE AI</option>
                <option value="CSE IOT">CSE IOT</option>
                <option value="CSE DATASCIENCE">CSE DATASCIENCE</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Electronics Engineering">Electronics Engineering</option>
              </select>

              <select
                name="year"
                id="studentYear"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs bg-white"
                required
              >
                <option value="choose student year">Choose Student Batch</option>
                <option value="2017-2021">2017-2021</option>
                <option value="2018-2022">2018-2022</option>
                <option value="2019-2023">2019-2023</option>
                <option value="2020-2024">2020-2024</option>
                <option value="2021-2025">2021-2025</option>
                <option value="2022-2026">2022-2026</option>
              </select>
            </div>

            <div className="mt-3.5">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Assign to Course Classroom (Optional)
              </label>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="w-full p-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200 shadow-xs bg-white"
              >
                <option value="">-- Do not assign to a classroom now --</option>
                {classrooms.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode ? `${c.courseCode} - ` : ""}
                    {c.title} ({c.branch} {c.batch})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Enrolling the student into a classroom immediately grants them access to that course's live lectures.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 mt-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Enrolling Student Please Wait..." : "Enroll Student"}
            </button>
          </form>
        </div>
      </div>
    
  );
}

export default AppLayout()(Students);
