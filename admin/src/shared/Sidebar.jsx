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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tooltip } from "@mui/material";
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
import Modal from "../components/Model";

const Sidebar = () => {
  const { userRole } = useContext(RoleContext);
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Loader state
  const [isLoading, setIsLoading] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate(path);
      }, 1500);
    }
  };

  const MenuItem = ({ path, icon: Icon, label, onClick, show = true }) => {
    if (!show) return null;

    return (
      <Tooltip title={label} placement="right">
        <motion.li
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className={`list-style-none flex items-center gap-4 font-medium p-4 mx-2 
            rounded-xl cursor-pointer transition-all duration-300 group
            ${isActive(path)
              ? "bg-white text-indigo-800 shadow-lg"
              : "text-white hover:bg-white/10"}`}
        >
          <div className={`p-2 rounded-lg ${isActive(path) ? "bg-indigo-100" : "group-hover:bg-white/5"}`}>
            <Icon className={`w-6 h-6 ${isActive(path) ? "text-indigo-600" : ""}`} />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </motion.li>
      </Tooltip>
    );
  };

  return (
    <div className="flex max-md:hidden">
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="sidebar fixed top-0 left-0 h-screen flex flex-col w-[280px] 
          bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 
          shadow-2xl"
      >
        <div className="p-6">
          <Logo />
        </div>

        <nav className="flex-1 mt-6">
          <ul className="flex flex-col gap-2">
            <MenuItem
              path="/dashboard"
              icon={DashboardIcon}
              label="Dashboard"
              onClick={() => handleNavigation("/dashboard")}
            />

            <MenuItem
              path="/add-teachers"
              icon={AssignmentIcon}
              label="Add Teachers"
              onClick={() => handleNavigation("/add-teachers")}
              show={userRole === 'Director'}
            />

            <MenuItem
              path="/enroll-students"
              icon={AssignmentIcon}
              label="Enroll Students"
              onClick={() => handleNavigation("/enroll-students")}
              show={userRole === 'Registrar'}
            />

            <MenuItem
              path="/announcement"
              icon={CampaignIcon}
              label="Announcement"
              onClick={() => handleNavigation("/announcement")}
              show={userRole === 'Teacher' || userRole === 'Director'}
            />

            <MenuItem
              path="/timetable"
              icon={EventNoteIcon}
              label="Time Table"
              onClick={() => handleNavigation("/timetable")}
              show={userRole === 'Teacher'}
            />

            <MenuItem
              path="/post-quiz"
              icon={QuizIcon}
              label="Quiz"
              onClick={() => handleNavigation("/post-quiz")}
              show={userRole === 'Teacher'}
            />

            <MenuItem
              path="/post-assignment"
              icon={AssignmentIcon}
              label="Assignment"
              onClick={() => handleNavigation("/post-assignment")}
              show={userRole === 'Teacher'}
            />

            <MenuItem
              path="/student-detail"
              icon={AssignmentIcon}
              label="Student Details"
              onClick={() => handleNavigation("/student-detail")}
              show={userRole === 'Registrar'}
            />

            <MenuItem
              path="/teachers"
              icon={AssignmentIcon}
              label="Teacher Details"
              onClick={() => handleNavigation("/teachers")}
              show={userRole === 'Registrar'}
            />

            {(userRole === 'Teacher' || userRole === 'Director') && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mx-2 mt-4"
              >
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 
                    bg-gradient-to-r from-blue-500 to-indigo-500 
                    text-white rounded-xl shadow-lg hover:shadow-xl
                    transition-all duration-300"
                >
                  <LiveTvIcon />
                  <span>Go Live Class</span>
                </button>
              </motion.div>
            )}
          </ul>
        </nav>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => console.log("Handle Room Join")}
        email=""
        setEmail={() => { }}
        roomId=""
        setRoomId={() => { }}
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
    </div>
  );
};

export default Sidebar;
