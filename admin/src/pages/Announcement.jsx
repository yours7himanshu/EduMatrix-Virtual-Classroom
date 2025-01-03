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
import SendIcon from "@mui/icons-material/Send";
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
    <>
      <div className="announcement bg-gray-50 h-screen ml-[10%]  w-[100%] overflow-x-hidden ">
        <div className="announcement justify-center flex flex-col items-center w-full mt-20  ">
          <div className="heading flex text-violet-700 border border-gray-100 shadow-lg p-2 rounded-md gap-2">
            <h1 className=" text-2xl  font-normal items-center flex">
              Post Announcement for your college
            </h1>
            <img className="w-15 h-16 " src={scholar} alt="" />
          </div>
          <form
            className="flex w-[40%] flex-col bg-white  gap-3 mt-5  rounded-md border border-gray-100 shadow-lg p-10"
            onSubmit={handleSubmit}
          >
            <select
              name="announcement category"
              value={category}
              className="p-2 border border-gray-300 rounded-md h-10 text-black"
              onChange={(e) => setCategory(e.target.value)}
              id="category"
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
            </select>
            <select
              name="studentCourse"
              id="studentCourse"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 transition duration-200 "
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
            </select>

            <input
              type="text"
              placeholder="Title"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
              }}
              className="border border-gray-300 h-10 p-2 focus:outline-none  rounded-md focus:ring-1 focus:ring-blue-600 transition duration-200"
            />

            <textarea
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className="border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-600 transition duration-200 rounded-md"
              placeholder="Enter Announcement Description"
              rows="4"
              cols="50"
            ></textarea>

            <div className="button flex gap-2  justify-center">
              <button
                className="bg-green-600 hover:bg-green-500 w-[50%] flex gap-2 items-center justify-center text-white h-10 rounded-md"
                type="submit"
                disabled={loading}
              >
                {loading ? "Posting" : "Post"}
                <SendIcon sx={{ height: "18px" }} />
              </button>
              <button
                onClick={handleClick}
                className="bg-blue-600 hover:bg-blue-500 p-2 w-[50%] rounded-md text-white "
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AppLayout()(Announcement);
