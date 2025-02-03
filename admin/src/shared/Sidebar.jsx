
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

import {  useState ,useContext} from "react";
import {  useLocation, useNavigate } from "react-router-dom";
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
import Modal from "../components/Model";
const Sidebar = () => {
 
  const {userRole} = useContext(RoleContext);
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

  return (
    <div className="flex max-md:hidden  ">
      {/* Sidebar */}
      <div className="sidebar fixed top-0  left-0 h-screen flex flex-col w-[20%] bg-gradient-to-tr from-indigo-800 to-blue-700 text-white">
        <ul className="flex flex-col ml-10 gap-5">
          <Logo />
          <div className="flex gap-4" >
          <li
            onClick={() => handleNavigation("/dashboard")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer hover:text-gray-700 transition-all duration-75 ${
              isActive("/dashboard")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
          <DashboardIcon/>
            Dashboard
          </li>
          </div>


{userRole==='Director' &&  <li
            onClick={() => handleNavigation("/add-teachers")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/add-teachers")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Add Teachers
          </li> }
         

         {userRole==='Registrar' &&  <li
            onClick={() => handleNavigation("/enroll-students")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/enroll-students")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Enroll Students
          </li>}
          
          {(userRole==='Teacher'||userRole==='Director') &&  <li
            onClick={() => handleNavigation("/announcement")}
            className={`list-style-none flex items-center gap-2 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/announcement")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <CampaignIcon/>
            Announcement
          </li>}
         

         {userRole==='Teacher'&& <li
            onClick={() => handleNavigation("/timetable")}
            className={`list-style-none flex gap-4 items-center font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/timetable")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <EventNoteIcon/>
            Time Table
          </li>}
         

         {userRole ==='Teacher' && <li
            onClick={() => handleNavigation("/post-quiz")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/post-quiz")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <QuizIcon/>
            Quiz
          </li>}
         

         {userRole==='Teacher'&& <li
            onClick={() => handleNavigation("/post-assignment")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/post-assignment")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            <AssignmentIcon/>
            Assignment
          </li>}
         

          {userRole === 'Registrar' && <li
            onClick={() => handleNavigation("/student-detail")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/admin-live")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Student Details
          </li>}

          {userRole === 'Registrar' && <li
            onClick={() => handleNavigation("/teachers")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/admin-live")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Teacher Details
          </li>}

         {(userRole === 'Teacher'|| userRole==='Director') && <div className="flex items-center gap-4" >
          <li
             onClick={() => setIsModalOpen(true)}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/admin-live")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
          <LiveTvIcon  />
            Go Live Class
          </li>
          </div>}
         
        </ul>
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
    </div>
  );
};

export default Sidebar;