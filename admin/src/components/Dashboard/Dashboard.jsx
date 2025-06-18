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

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader } from "lucide-react";

// Register the components

const Dashboard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [barplot1, setbarplot1] = useState("");
  const [barplot2, setbarplot2] = useState("");
  const [scatter, setScatter] = useState("");
  const [topStudents, setTopStudents] = useState("");
  const [pieplot, setPieplot] = useState("");
  const [fees_status, setfees_status] = useState("");
  const [placement_status, setplacement_status] = useState("");
  const [branch_placement, setbranch_placement] = useState("");

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/test`);
        if (response.data.success) {
          console.log(response.data.analysis);

          setbarplot1(
            `data:image/png;base64,${response.data.analysis.result.barplot1}`
          );
          setbarplot2(
            `data:image/png;base64,${response.data.analysis.result.barplot2}`
          );
          setScatter(
            `data:image/png;base64,${response.data.analysis.result.scatter}`
          );
          setTopStudents(
            `data:image/png;base64,${response.data.analysis.result.top_students}`
          );
          setPieplot(
            `data:image/png;base64,${response.data.analysis.result.pieplot}`
          );

          setfees_status(
            `data:image/png;base64,${response.data.analysis.result.fees_status}`
          );
          setplacement_status(
            `data:image/png;base64,${response.data.analysis.result.placement_status}`
          );
          setbranch_placement(
            `data:image/png;base64,${response.data.analysis.result.branch_placement}`
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCharts();
  }, []);

  return (
    <div className="dashboard flex">
      <div className=" bg-gray-100  w-[100%]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Marks and Attendance Relation
            </h2>
            {scatter ? (
              <img src={scatter} alt="Marks and Attendance Relation" className="w-full h-auto object-contain"/>
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-blue-500 h-10 w-10" />
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Branchwise Student Distribution
            </h2>
            {pieplot ? (
              <img className="w-full h-auto object-contain" src={pieplot} alt="Branchwise Student Distribution" />
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-blue-500 h-10 w-10" />
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Attendance Overview
            </h2>
            {barplot1 ? (
              <img src={barplot1} alt="Attendance Overview" className="w-full h-auto object-contain"/>
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-blue-500 h-10 w-10" />
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Marks Overview
            </h2>
            {barplot2 ? (
              <img src={barplot2} alt="Marks Overview" className="w-full h-auto object-contain"/>
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-blue-500 h-10 w-10" />
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Top Students
            </h2>
            {topStudents ? (
              <img className="w-full h-auto object-contain" src={topStudents} alt="Top Students" />
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-gray-500 h-10 w-10" />
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Fees Analysis
            </h2>
            {fees_status ? (
              <img className="w-full h-auto object-contain" src={fees_status} alt="Fees Analysis" />
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-gray-500 h-10 w-10" />
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Branchwise Placement Analysis
            </h2>
            {branch_placement ? (
              <img className="w-full h-auto object-contain" src={branch_placement} alt="Branchwise Placement Analysis" />
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-gray-500 h-10 w-10" />
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Placement Analysis
            </h2>
            {placement_status ? (
              <img className="w-full h-auto object-contain" src={placement_status} alt="Placement Analysis" />
            ) : (
              <div className="flex justify-center items-center py-10">
                <Loader className="animate-spin text-gray-500 h-10 w-10" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
