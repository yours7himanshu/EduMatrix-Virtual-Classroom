import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ContextStore } from "../store/ContextStore";
import Logo from "../components/Dashboard/Logo";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

const Sidebar = () => {
  const { collegeName } = useContext(ContextStore);
  const location = useLocation();
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
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar fixed top-0 left-0 h-screen flex flex-col w-[20%] bg-blue-600 text-white">
        <ul className="flex flex-col ml-10 gap-5">
          <Logo />
          <li
            onClick={() => handleNavigation("/dashboard")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/dashboard")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Dashboard
          </li>
          <li
            onClick={() => handleNavigation("/add-teachers")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/add-teachers")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Add Teachers
          </li>
          <li
            onClick={() => handleNavigation("/enroll-students")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/enroll-students")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Enroll Students
          </li>
          <li
            onClick={() => handleNavigation("/announcement")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/announcement")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Announcement
          </li>
          <li
            onClick={() => handleNavigation("/timetable")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/timetable")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Time Table
          </li>
          <li
            onClick={() => handleNavigation("/post-quiz")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/post-quiz")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Quiz
          </li>
          <li
            onClick={() => handleNavigation("/post-assignment")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/post-assignment")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Assignment
          </li>
          <li
            onClick={() => handleNavigation("/admin-live")}
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/admin-live")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Go Live Class
          </li>
        </ul>
      </div>

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
