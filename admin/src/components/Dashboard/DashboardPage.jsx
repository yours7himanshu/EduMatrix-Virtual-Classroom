
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

import Dashboard from "./Dashboard";

import Teachers from "../Teachers/Teachers";
import AppLayout from "../../layout/AppLayout";

const DashboardPage = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="flex w-full items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            Dashboard Overview
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all">
            <h2 className="text-base sm:text-lg font-medium text-gray-600">
              Total Students
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 my-1">3,500</p>
            <span className="text-xs sm:text-sm text-gray-400 font-medium">+12% from last month</span>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all">
            <h2 className="text-base sm:text-lg font-medium text-gray-600">
              Total Teachers
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-green-600 my-1">150</p>
            <span className="text-xs sm:text-sm text-gray-400 font-medium">+5 from last month</span>
          </div>

          {/* Total Courses */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all">
            <h2 className="text-base sm:text-lg font-medium text-gray-600">
              Total Courses
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-orange-600 my-1">50</p>
            <span className="text-xs sm:text-sm text-gray-400 font-medium">+3 new this month</span>
          </div>

          {/* Upcoming Announcements */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all">
            <h2 className="text-base sm:text-lg font-medium text-gray-600">
              Announcements
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-red-600 my-1">2</p>
            <span className="text-xs sm:text-sm text-gray-400 font-medium">Check latest updates</span>
          </div>
        </div>

        <Dashboard />

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-8 mb-3">
          Teachers Overview
        </h2>
        <Teachers />
      </div>
    </div>
  );
};

export default AppLayout()(DashboardPage);
