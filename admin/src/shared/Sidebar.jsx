import {  useState ,useContext} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
const Sidebar = () => {
 
  const {userRole} = useContext(RoleContext);
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
          <div className="flex gap-4" >
          <li
            onClick={() => handleNavigation("/dashboard")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/dashboard")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Dashboard
          <DashboardIcon/>
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
            Announcement
            <CampaignIcon/>
          </li>}
         

         {userRole==='Teacher'&& <li
            onClick={() => handleNavigation("/timetable")}
            className={`list-style-none flex gap-4 items-center font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/timetable")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Time Table
            <EventNoteIcon/>
          </li>}
         

         {userRole ==='Teacher' && <li
            onClick={() => handleNavigation("/post-quiz")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/post-quiz")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Quiz
            <QuizIcon/>
          </li>}
         

         {userRole==='Teacher'&& <li
            onClick={() => handleNavigation("/post-assignment")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/post-assignment")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Assignment
            <AssignmentIcon/>
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
            onClick={() => handleNavigation("/admin-live")}
            className={`list-style-none flex items-center gap-4 font-medium focus:bg-blue-400 p-3 w-[80%] cursor-pointer ${
              isActive("/admin-live")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Go Live Class
          <LiveTvIcon  />
          </li>
          </div>}
         
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
