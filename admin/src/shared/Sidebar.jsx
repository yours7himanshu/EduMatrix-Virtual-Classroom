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

import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { ContextStore } from "../store/ContextStore";
import Logo from "../components/Dashboard/Logo";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";
import { RoleContext } from "../context/RoleContext";
import LiveTvIcon from '@mui/icons-material/LiveTv';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventNoteIcon from '@mui/icons-material/EventNote';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {

  const { userRole } = useContext(RoleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {logout} = useAuth();

  // Loader state
  const [isLoading, setIsLoading] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      setIsLoading(true);
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        setIsLoading(false);
        navigate(path);
      }, 1500);
    }
  };

  // Nav Items component to avoid repetition
  const SidebarNavList = () => (
    <ul className="flex flex-col gap-2.5 w-full">
      <li
        onClick={() => handleNavigation("/dashboard")}
        className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
          isActive("/dashboard")
            ? "bg-white text-indigo-900 shadow-md font-semibold"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        }`}
      >
        <DashboardIcon fontSize="small" />
        <span>Dashboard</span>
      </li>

      {userRole === 'Director' && (
        <li
          onClick={() => handleNavigation("/add-teachers")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/add-teachers")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <PersonAddIcon fontSize="small" />
          <span>Add Teachers</span>
        </li>
      )}

      {userRole === 'Director' && (
        <li
          onClick={() => handleNavigation("/director-feedback")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/director-feedback")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <QuestionAnswerIcon fontSize="small" />
          <span>User Feedbacks</span>
        </li>
      )}

      {userRole === 'Registrar' && (
        <li
          onClick={() => handleNavigation("/enroll-students")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/enroll-students")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <GroupAddIcon fontSize="small" />
          <span>Enroll Students</span>
        </li>
      )}

      {(userRole === 'Teacher' || userRole === 'Director') && (
        <li
          onClick={() => handleNavigation("/announcement")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/announcement")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <CampaignIcon fontSize="small" />
          <span>Announcement</span>
        </li>
      )}

      {userRole === 'Teacher' && (
        <li
          onClick={() => handleNavigation("/timetable")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/timetable")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <EventNoteIcon fontSize="small" />
          <span>Time Table</span>
        </li>
      )}

      {userRole === 'Teacher' && (
        <li
          onClick={() => handleNavigation("/ai-predictor")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/ai-predictor")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <TrendingUpIcon fontSize="small" />
          <span>AI Predictor</span>
        </li>
      )}

      {userRole === 'Teacher' && (
        <li
          onClick={() => handleNavigation("/question-generator")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/question-generator")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <QuestionAnswerIcon fontSize="small" />
          <span>Question Generator</span>
        </li>
      )}

      {userRole === 'Teacher' && (
        <li
          onClick={() => handleNavigation("/post-quiz")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/post-quiz")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <QuizIcon fontSize="small" />
          <span>Quiz</span>
        </li>
      )}

      {userRole === 'Teacher' && (
        <li
          onClick={() => handleNavigation("/post-assignment")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/post-assignment")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <AssignmentIcon fontSize="small" />
          <span>Assignment</span>
        </li>
      )}

      {userRole === 'Teacher' && (
        <li
          onClick={() => handleNavigation("/student-marks-attendance")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/student-marks-attendance")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <EditAttributesIcon fontSize="small" />
          <span>Fill Student Details</span>
        </li>
      )}

      {userRole === 'Registrar' && (
        <li
          onClick={() => handleNavigation("/student-detail")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/student-detail")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <PeopleIcon fontSize="small" />
          <span>Student Details</span>
        </li>
      )}

      {userRole === 'Registrar' && (
        <li
          onClick={() => handleNavigation("/registrar-student")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/registrar-student")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <AccountBalanceWalletIcon fontSize="small" />
          <span>Student Fees Details</span>
        </li>
      )}

      {userRole === 'Registrar' && (
        <li
          onClick={() => handleNavigation("/teachers")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/teachers")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <PersonIcon fontSize="small" />
          <span>Teacher Details</span>
        </li>
      )}

      {(userRole === 'Teacher' || userRole === 'Director') && (
        <li
          onClick={() => handleNavigation("/admin-live")}
          className={`flex items-center gap-3.5 font-medium p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-150 ${
            isActive("/admin-live")
              ? "bg-white text-indigo-900 shadow-md font-semibold"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <LiveTvIcon fontSize="small" />
          <span>Go Live Class</span>
        </li>
      )}
    </ul>
  );

  const LogoutButton = () => (
    <div onClick={logout} className="pt-3 pb-2 mt-auto border-t border-white/10">
      <button
        type="button"
        className="flex items-center justify-center gap-3 font-semibold p-3 w-full cursor-pointer transition-all duration-200 bg-white hover:bg-gray-100 text-indigo-800 rounded-xl shadow-md hover:shadow-lg border border-indigo-100"
      >
        <LogoutIcon fontSize="small" className="text-indigo-800" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/90 z-30 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <img src="/logo/EduMatrix2.png" className="h-8 w-8 rounded-full object-contain" alt="EduMatrix Logo" />
          <span className="font-bold text-lg text-indigo-950 tracking-tight">EduMatrix</span>
          {userRole && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {userRole}
            </span>
          )}
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Slide-Over Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer Panel */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-gradient-to-tr from-indigo-800 to-blue-700 text-white z-50 shadow-2xl flex flex-col p-4 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/15">
          <div className="flex items-center gap-2">
            <img src="/logo/EduMatrix2.png" className="h-8 w-8 rounded-full object-contain" alt="EduMatrix" />
            <span className="font-bold text-xl text-white">EduMatrix</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar py-2">
          <SidebarNavList />
        </div>

        <LogoutButton />
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-gradient-to-tr from-indigo-800 to-blue-700 text-white z-30 shadow-xl p-4">
        <div className="p-3 rounded-2xl mb-4 bg-white/10 backdrop-blur-xs border border-white/15">
          <Logo />
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar py-2">
          <SidebarNavList />
        </div>

        <LogoutButton />
      </aside>

      {/* Route Navigation Loader */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100/90 backdrop-blur-sm fixed top-0 left-0 z-50">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            className="w-20 h-20"
          />
        </div>
      )}
    </>
  );
};

export default Sidebar;