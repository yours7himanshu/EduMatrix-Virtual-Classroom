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
import Modal from "../components/Model";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {

  const { userRole } = useContext(RoleContext);
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Sidebar content component to avoid repetition
  const SidebarContent = () => (
    <ul className="flex flex-col px-3 w-full h-full"> {/* Removed md:ml-10, added px-3 */}
      {/* Fixed Logo */}
      {/* Added p-4 and background to this sticky div. Note: p-4 on this div inside a px-3 ul means logo area has more effective padding. This could be adjusted if needed. */}
      <div className="sticky top-3 z-20 p-3 rounded-full mb-8 border-blue-500  border max-md:hidden "> {/* Added -mx-3 to make this div full-bleed against parent's px-3 */}
        <Logo />
      </div>
      {/* Scrollable nav items */}
      <div className="flex flex-col gap-5 overflow-y-auto hide-scrollbar flex-1 py-2 "> {/* Removed px-4 */}
        <div className="flex gap-4 max-md:mt-20 ">
          <li
            onClick={() => handleNavigation("/dashboard")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer hover:text-gray-700 transition-all duration-75 ${
              isActive("/dashboard")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <DashboardIcon />
            <span>Dashboard</span>
          </li>
        </div>

        {userRole === 'Director' && <li
          onClick={() => handleNavigation("/add-teachers")}
          className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/add-teachers")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <PersonAddIcon />
          <span>Add Teachers</span>
        </li>}

        {userRole === 'Director' && <li
          onClick={() => handleNavigation("/director-feedback")}
          className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/director-feedback")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <QuestionAnswerIcon />
          <span>User Feedbacks</span>
        </li>}

        {userRole === 'Registrar' && <li
          onClick={() => handleNavigation("/enroll-students")}
          className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/enroll-students")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <GroupAddIcon />
          <span>Enroll Students</span>
        </li>}

        {(userRole === 'Teacher' || userRole === 'Director') && <li
          onClick={() => handleNavigation("/announcement")}
          className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/announcement")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <CampaignIcon />
          <span>Announcement</span>
        </li>}

        {userRole === 'Teacher' && <li
          onClick={() => handleNavigation("/timetable")}
          className={`list-style-none flex gap-4 items-center font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/timetable")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <EventNoteIcon />
          <span>Time Table</span>
        </li>}

        {userRole === 'Teacher' && <li
          onClick={() => handleNavigation("/ai-predictor")}
          className={`list-style-none flex gap-4 items-center font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/ai-predictor")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <TrendingUpIcon />
          <span>AI Predictor</span>
        </li>}

        {userRole === 'Teacher' && <li
          onClick={() => handleNavigation("/question-generator")}
          className={`list-style-none flex gap-4 items-center font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/question-generator")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <QuestionAnswerIcon />
          <span>Question Generator</span>
        </li>}
        {userRole === 'Teacher' && <li
          onClick={() => handleNavigation("/post-quiz")}
          className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/post-quiz")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <QuizIcon />
          <span>Quiz</span>
        </li>}

        {userRole === 'Teacher' && <li
          onClick={() => handleNavigation("/post-assignment")}
          className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/post-assignment")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <AssignmentIcon />
          <span>Assignment</span>
        </li>}

        {userRole === 'Teacher' && <li
          onClick={() => handleNavigation("/student-marks-attendance")}
          className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/student-marks-attendance")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <EditAttributesIcon />
          <span>Fill Student Details</span>
        </li>}

        {userRole === 'Registrar' && <li
          onClick={() => handleNavigation("/student-detail")}
          className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/admin-live")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <PeopleIcon />
          <span>Student Details</span>
        </li>}

        {userRole === 'Registrar' && <li
          onClick={() => handleNavigation("/registrar-student")}
          className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/registrar-student")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <AccountBalanceWalletIcon />
          <span>Student Fees Details</span>
        </li>}

        {userRole === 'Registrar' && <li
          onClick={() => handleNavigation("/teachers")}
          className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
            isActive("/admin-live")
              ? "bg-white text-black border rounded-md"
              : "text-white"
          }`}
        >
          <PersonIcon />
          <span>Teacher Details</span>
        </li>}

        {(userRole === 'Teacher' || userRole === 'Director') && <div className="flex items-center gap-4">
          <li
            onClick={() => setIsModalOpen(true)}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-full cursor-pointer ${
              isActive("/admin-live")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <LiveTvIcon />
            <span>Go Live Class</span>
          </li>
        </div>}
      </div>
      {/* Logout Button */}
      <div onClick={logout} className="mt-5 mb-8"> {/* Removed mr-4 */}
        <li
          className="list-style-none flex items-center gap-4 font-medium p-3 w-full cursor-pointer transition-all duration-300 bg-white hover:bg-gray-100 text-indigo-800 rounded-lg shadow-md hover:shadow-lg border border-indigo-100"
        >
          <LogoutIcon className="text-indigo-800" />
          <span>Logout</span>
        </li>
      </div>
    </ul>
  );

  return (
    <>
      {/* Hamburger menu for mobile */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-blue-700 text-white"
        >
          {isMobileMenuOpen ? <CloseIcon className="text-white bg-red-700 rounded-md w-6 h-6" /> : <MenuIcon className="text-white" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 w-full h-screen bg-gradient-to-tr from-indigo-800 to-blue-700 text-white z-40 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} overflow-y-auto p-4`}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div className="sidebar fixed top-0 left-0 h-screen flex flex-col w-[20%] bg-gradient-to-tr from-indigo-800 to-blue-700 text-white">
          <SidebarContent />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => console.log("Handle Room Join")}
        email=""
        setEmail={() => {}}
        roomId=""
        setRoomId={() => {}}
        loading={false}
      />

      {/* Loader */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center w-full h-screen bg-gray-100 absolute top-0 left-0 z-50">
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