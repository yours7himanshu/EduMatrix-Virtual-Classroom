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
// import SendIcon from "@mui/icons-material/Send";
import AppLayout from "../layout/AppLayout";
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
      if (error.response?.data?.message)
       {
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
    setCategory('');
    setDescription('');
    setBranch('');
    setCourse('');
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full"> {/* Ensure w-full on root, added flex-col */}
      <div className="w-full max-w-4xl ">
        <div className="flex flex-col items-center justify-center"> {/* This parent ensures children can be centered or full width as needed */}
          <div className="text-center mb-5 w-full"> {/* Added w-full to allow content below to be properly centered or max-width constrained */}
            <div className="inline-flex flex-col sm:flex-row justify-center items-center gap-4 bg-white px-6 py-3 rounded-xl shadow-md border border-violet-100 max-w-xl mx-auto"> {/* Removed ml-56, added max-w-xl mx-auto, responsive flex direction */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-black max-md:text-xl"> {/* Removed ml-10, responsive text */}
                Post College Announcement
              </h1>
              <img className="w-12 max-md:hidden h-12 sm:w-16 sm:h-16 object-contain" src={scholar} alt="Scholar icon" /> {/* Responsive image size */}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 w-full"> {/* Removed ml-64, adjusted padding */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <select
                  name="announcement category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-gray-100 outline-none"
                >
                  <option value="chose">Choose Category </option>
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
                  <option value="Suggestions">
                    Suggestions
                  </option>
                </select>

                <select
                  name="studentCourse"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-gray-100 outline-none"
                  required
                >
                  <option value="Branch">Choose Course For Announcement</option>
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
                  <option value="All Departments">
                    All Departments
                  </option>
                </select>

                <input
                  type="text"
                  placeholder="Title"
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                  }}
                  className="w-full outline-none p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-gray-100 "
                />

                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(`${e.target.value}`);
                  }}
                  placeholder="Enter Announcement Description"
                  rows="6"
                  className="w-full outline-none p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-gray-100 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-500 hover:to-green-400 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 max-md:p-2 "
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    <>
                      Post 
                      {/* <SendIcon sx={{ height: "20px" }} className="max-md:hidden" /> */}
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClick}
                  type="button"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white  py-3 px-6 rounded-lg font-medium hover:from-blue-500 hover:to-blue-400 transition-all duration-200  max-md:p-2 max-md:h-14"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout()(Announcement);
