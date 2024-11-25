import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ContextStore } from "../store/ContextStore";
import Logo from "./Logo";
const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const { collegeName } = useContext(ContextStore);
  return (
    <div className="sidebar flex flex-col w-[20%] bg-blue-500 text-white">
      <ul className="flex  flex-col ml-10 gap-5">
        <Logo />
        <Link to="/dashboard">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "dashboard"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("dashboard")}
          >
            Dashboard
          </li>
        </Link>
        <Link to="/add-teachers">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "teachers"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("teachers")}
          >
            Add Teachers
          </li>
        </Link>
        <Link to="/enroll-students">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "students"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("students")}
          >
            Enroll Students
          </li>
        </Link>

        <Link to="/announcement">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "announcement"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("announcement")}
          >
            Announcement
          </li>
        </Link>
        <Link to="/timetable">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "timetable"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("timetable")}
          >
            Time Table
          </li>
        </Link>

        <Link to="/post-quiz">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "quiz"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("quiz")}
          >
        Quiz
          </li>
        </Link>

        <Link to="/post-assignment">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "assignment"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("assignment")}
          >
            Assignment
          </li>
        </Link>

        <Link to="/admin-live">
          <li
            className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${
              activeItem === "live"
                ? "bg-white text-black border rounded-md"
                : "text-white"
            }`}
            onClick={() => setActiveItem("live")}
          >
            Go Live Class
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;
