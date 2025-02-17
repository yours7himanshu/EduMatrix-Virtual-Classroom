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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const controller = new AbortController();
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/v3/displayAnnouncement`,{
          signal:controller.signal,
        });
        if (response.data.success) {
          console.log(response.data.getAnnouncement);
          setAnnouncement(response.data.getAnnouncement);
        }
      } catch (error) {
        if(error.response?.data?.message){
          console.log(error.response.data.message);
        }
      }
    };
    fetchAnnouncement();

    // writing a clean up function
    return ()=>{
      controller.abort();
    };
  }, [backendUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br w-full ml-72 from-gray-50 to-blue-100 p-8">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
        College Announcements
      </h1>
     {announcement ? ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {announcement.map((value, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                {value.category}
              </h3>
              <div className="text-gray-600 mb-4">
                <p className="flex items-center space-x-2">
                  <span className="font-medium text-blue-600">Course:</span>
                  <span>{value.course}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="font-medium text-blue-600">Branch:</span>
                  <span>{value.branch}</span>
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">{value.description}</p>
            </div>
          </div>
        ))}
      </div>):(
        <div className="flex ml-72 rounded-md justify-center w-[50%] px-2 py-3 border border-red-500 text-red-600" >

       There is no announcement to show currently

        </div>
      )}
    </div>
  );
}

export default Layout()(Announcement)
