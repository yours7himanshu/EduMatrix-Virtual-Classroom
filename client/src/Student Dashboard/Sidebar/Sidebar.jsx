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

import { useLocation, useNavigate } from "react-router-dom";
// import { ContextStore } from "../store/ContextStore";

import LiveTvIcon from "@mui/icons-material/LiveTv";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventNoteIcon from "@mui/icons-material/EventNote";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentIcon from "@mui/icons-material/Payment";
import Logo from "./Logo";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import SummarizeIcon from '@mui/icons-material/Summarize';
import DescriptionIcon from '@mui/icons-material/Description';
import AssistantIcon from '@mui/icons-material/Assistant';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <div className="flex max-md:hidden w-[20%] ">
      {/* Sidebar */}
      <div className="sidebar fixed top-0  left-0 h-screen flex flex-col w-[20%] bg-gradient-to-tr from-indigo-800 to-blue-700 text-white">
        <div className="sticky  top-0 z-20 w-[90%] ml-7 ">
          <Logo />
        </div>
        <ul className="flex flex-col ml-10 gap-5 overflow-y-auto hide-scrollbar">
          <div className="flex gap-4 ">
            <li
              onClick={() => handleNavigation("/StudentDashboard/dashboard")}
              className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer hover:text-gray-700 transition-all duration-75 ${
                isActive("/StudentDashboard/dashboard")
                  ? "bg-white text-black border rounded-md"
                  : "text-white"
              }`}
            >
              <DashboardIcon />
              Dashboard
            </li>
          </div>

          <li
            onClick={() => handleNavigation("/StudentDashboard/announcement")}
            className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/StudentDashboard/announcement")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <CampaignIcon />
            Announcements
          </li>

          <li
            onClick={() => handleNavigation("/StudentDashboard/notes")}
            className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/StudentDashboard/notes")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <SummarizeIcon />
            Summarizer
          </li>

          <li
            onClick={() => handleNavigation("/StudentDashboard/teachersNotes")}
            className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/StudentDashboard/teachersNotes")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <DescriptionIcon />
            Teachers Notes
          </li>

          <li
            onClick={() => handleNavigation("/StudentDashboard/quiz")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/StudentDashboard/quiz")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <QuizIcon />
            Quizes
          </li>

          <li
            onClick={() => handleNavigation("/StudentDashboard/assignment")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/StudentDashboard/assignment")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <AssignmentIcon />
            Assignments
          </li>
          <li
            onClick={() => handleNavigation("/StudentDashboard/payfees")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer hover:text-gray-700 transition-all duration-75 ${
              isActive("/StudentDashboard/payfees")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <PaymentIcon />
            Pay Fees
          </li>
          <li
            onClick={() => handleNavigation("/StudentDashboard/library")}
            className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/StudentDashboard/library")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <LocalLibraryIcon />
            Library
          </li>

          <li
            onClick={() => handleNavigation("/ai")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer hover:text-gray-700 transition-all duration-75 ${
              isActive("/ai")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <AssistantIcon />
            AI Assistent
          </li>

          <div className="flex items-center gap-4">
            <li
              onClick={() => navigate("/live-class")}
              className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
                isActive("/live-class")
                  ? "bg-white text-black border rounded-md"
                  : "text-white"
              }`}
            >
              <LiveTvIcon />
              Live Class
            </li>
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
