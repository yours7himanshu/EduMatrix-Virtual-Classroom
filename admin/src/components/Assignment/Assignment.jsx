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
  const [pdfFile, setPdfFile] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please upload a PDF file for the assignment.");
      return;
    }
    setLoading(true);
    // Prepare form data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("questions", questions);
    formData.append("deadline", deadline);
    formData.append("pdfFile", pdfFile);

    try {
      const response = await axios.post(
        `${backendUrl}/api/v7/postAssignment`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
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
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> {/* Removed ml-[20%], ensured w-full */}
      <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl max-md:text-2xl font-bold text-indigo-600 text-center">
              Create New Assignment
            </h1>

            {/* Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter assignment title"
                value={title}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Description</label>
              <input
                type="text"
                placeholder="Enter assignment description"
                value={description}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Questions */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Subject</label>
              <input
                type="text"
                placeholder="Enter subject name"
                value={questions}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onChange={(e) => setQuestions(e.target.value)}
                rows={4}
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Upload PDF</label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div className="pt-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Assignment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppLayout()(Assignment);
