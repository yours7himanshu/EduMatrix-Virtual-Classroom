import React from "react";
import { Line } from "react-chartjs-2";


import Dashboard from "./Dashboard";

import Teachers from "../Teachers/Teachers";
import AppLayout from "../../layout/AppLayout";

const DashboardPage = () => {
  return (
    <div className="dashboard flex ">
   
      <div className="flex flex-col ml-[20%] w-[80%]  p-4   py-6 bg-gray-100">
     
        <div className="flex w-[80%]  items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="text-gray-600">Welcome, Admin!</div>
        </div>

        
        <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
         
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              Total Students
            </h2>
            <p className="text-4xl font-bold text-blue-600">3,500</p>
            <span className="text-sm text-gray-500">+12% from last month</span>
          </div>

          
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              Total Teachers
            </h2>
            <p className="text-4xl font-bold text-green-600">150</p>
            <span className="text-sm text-gray-500">+5 from last month</span>
          </div>

          {/* Total Courses */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              Total Courses
            </h2>
            <p className="text-4xl font-bold text-orange-600">50</p>
            <span className="text-sm text-gray-500">+3 new this month</span>
          </div>

          {/* Upcoming Announcements */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              Upcoming Announcements
            </h2>
            <p className="text-4xl font-bold text-red-600">2</p>
            <span className="text-sm text-gray-500">Check latest updates</span>
          </div>
        </div>

        <Dashboard  />
        <h1 className="text-3xl font-semibold text-gray-800">
            Teachers Overview
          </h1>
        <Teachers/>
      </div>
    </div>
  );
};

export default AppLayout()(DashboardPage);
