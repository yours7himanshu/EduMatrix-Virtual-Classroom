// Copyright (c) 2024 Himanshu Dinkar
//  See LICENSE file in the project directory for full License information
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


const Assignment = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTimeout(setLoading(true), 2000);

    try {
      const response = await axios.post(`${backendUrl}/api/v7/postAssignment`, {
        title,
        description,
        questions,
        deadline,
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log("Some error occurred posting Assignment", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Some unexpected error occurred, please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full  flex ml-[23%]">
      <div className="flex w-full  gap-8">
        {/* Sidebar */}
        

       <div className="form-details flex justify-center items-center h-screen w-[70%]">
       <form
          onSubmit={handleSubmit}
          className="w-full h-[90%] lg:w-3/4 p-6 bg-white rounded-lg shadow-md"
        >
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-800 text-center">
              Post New Assignment: Empower Your Students with Engaging Challenges!
            </h1>

            {/* Title Input */}
            <div>
              <label className="block text-gray-600 font-medium">Title</label>
              <input
                type="text"
                placeholder="Enter assignment title"
                value={title}
                required
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-gray-600 font-medium">Description</label>
              <input
                type="text"
                placeholder="Enter assignment description"
                value={description}
                required
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Questions Input */}
            <div>
              <label className="block text-gray-600 font-medium">Questions</label>
              <input
                type="text"
                placeholder="Enter assignment questions"
                value={questions}
                required
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setQuestions(e.target.value)}
              />
            </div>

            {/* Deadline Input */}
            <div>
              <label className="block text-gray-600 font-medium">Deadline</label>
              <input
                type="date"
                value={deadline}
                required
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                disabled={loading}
                type="submit"
                className="w-full p-3 bg-green-500 text-white font-medium rounded-md  disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Assignment"}
              </button>
            </div>
          </div>
        </form>
       </div>
     
      </div>
    </div>
  );
};

export default AppLayout()(Assignment);
