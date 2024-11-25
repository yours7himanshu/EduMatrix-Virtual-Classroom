import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ContextStore } from "../store/ContextStore";
import Logo from "./Logo";

const Sidebar = () => {
  const { collegeName } = useContext(ContextStore);
  const location = useLocation();

  // A function to check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar h-screen flex flex-col w-[20%] bg-blue-500 text-white">
      <ul className="flex flex-col ml-10 gap-5">
        <Logo />
        <Link to="/dashboard">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/dashboard")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Dashboard
          </li>
        </Link>
        <Link to="/add-teachers">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/add-teachers")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Add Teachers
          </li>
        </Link>
        <Link to="/enroll-students">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/enroll-students")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Enroll Students
          </li>
        </Link>
        <Link to="/announcement">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/announcement")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Announcement
          </li>
        </Link>
        <Link to="/timetable">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/timetable")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Time Table
          </li>
        </Link>
        <Link to="/post-quiz">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/post-quiz")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Quiz
          </li>
        </Link>
        <Link to="/post-assignment">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/post-assignment")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Assignment
          </li>
        </Link>
        <Link to="/admin-live">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              isActive("/admin-live")
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
          >
            Go Live Class
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;
