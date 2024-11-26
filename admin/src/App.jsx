import "./App.css";
import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminSignUp from "./pages/AdminSignUp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddTeacher from "./components/AddTeacher";
import Announcement from "./pages/Announcement";
import Students from "./components/Students";
import TimeTable from "./components/TimeTable";
import Classes from "./components/Classes";
import AdminLive from "./components/AdminLive";
import CreateQuiz from "./components/CreateQuiz";
import Assignment from "./components/Assignment";
import DashboardPage from "./components/DashboardPage";

import Teachers from "./components/Teachers";

function App() {
  return (
    <>
      <div className="app  ">
        <ToastContainer />

        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/sign-up" element={<AdminSignUp />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/enroll-students" element={<Students />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/add-teachers" element={<AddTeacher />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/timetable" element={<TimeTable />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/admin-live" element={<AdminLive />} />
          <Route path="/post-quiz" element={<CreateQuiz />} />
          <Route path="/post-assignment" element={<Assignment />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
