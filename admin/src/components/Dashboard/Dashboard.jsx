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

import { Bar, Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";


// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const attendanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Attendance (%)",
        data: [90, 85, 80, 88, 95, 92],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
 
  const marksData = {
    labels: ["Math", "Science", "History", "English", "Arts"],
    datasets: [
      {
        label: "Marks",
        data: [85, 90, 80, 88, 95],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard flex ">
      
      <div className="p-8 bg-gray-100  w-[100%]">
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Attendance Overview
            </h2>
            <Bar
              data={attendanceData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Marks Overview
            </h2>
            <Line
              data={marksData}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
