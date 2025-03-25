// Copyright 2024 Himanshu Dinkar

/*
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
import axios from "axios";
import Layout from "../Layout/Layout";

function Announcement() {
  const [announcement, setAnnouncement] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const controller = new AbortController();
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/v3/displayAnnouncement`,{
          signal:controller.signal,
        });
        if (response.data.success) {
          setAnnouncement(response.data.getAnnouncement);
        }
      } catch (error) {
        if(error.response?.data?.message){
          console.log(error.response.data.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();

    // writing a clean up function
    return ()=>{
      controller.abort();
    };
  }, [backendUrl]);

  // Function to get category-specific styling
  const getCategoryStyle = (category) => {
    const categories = {
      "Exam": "bg-red-100 text-red-800 border-red-300",
      "Event": "bg-purple-100 text-purple-800 border-purple-300",
      "Holiday": "bg-green-100 text-green-800 border-green-300",
      "Assignment": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Lecture": "bg-blue-100 text-blue-800 border-blue-300",
    };
    
    return categories[category] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Format date if it exists in the data
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">
            College Announcements
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest information, events, and notices from the administration
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : announcement && announcement.length > 0 ? (
          <div className="flex flex-col items-center space-y-6 md:space-y-8">
            {announcement.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col w-full md:w-4/5 transform hover:-translate-y-1"
              >
                <div className={`px-4 py-2 border-b ${getCategoryStyle(value.category)}`}>
                  <span className="font-semibold">{value.category}</span>
                </div>
                <div className="p-5 flex-grow">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-indigo-600 font-medium mr-2">Course:</span>
                      <span className="text-gray-700">{value.course}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-600 font-medium mr-2">Branch:</span>
                      <span className="text-gray-700">{value.branch}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{value.description}</p>
                  
                  {value.date && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
                      {formatDate(value.date)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Announcements</h3>
            <p className="text-gray-600">
              There are no announcements to display at this time. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Layout()(Announcement);
