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

import Signup from "./pages/Auth/SignUp.jsx";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import JoinLecture from "./components/JoinLectures.jsx";
import AboutPage from "./pages/About/AboutPage.tsx";
import ContactPage from "./pages/Contact/ContactPage.tsx";
import CoursesPage from "./pages/Courses/CoursesPage.tsx";
import NotesPage from "./pages/Notes/NotesPage.jsx";
import SyllabusPage from "./pages/Syllabus/SyllabusPage.jsx";
import QuizList from "./Student Dashboard/Quiz/QuizList.jsx";
import Login from "./pages/Auth/Login.jsx";
import { PeerProvider } from "./providers/Peer.jsx";
import MainLoginPage from "./pages/Auth/MainLoginPage.jsx";

import Announcement from "./Student Dashboard/Announcement/Announcement.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import AiAssistent from "./Student Dashboard/AI Powered Assistant/AiAssistent.jsx";
import StudentDashboard from "./Student Dashboard/Dashboard/StudentDashboard.jsx";
import Assignment from "./Student Dashboard/Assignments/Assignment.tsx";

// import ModalComponent from "./Modal/ModalComponent.jsx";

function App() {
  return (
    <>
      {/* <Navbar /> */}

      <ToastContainer />
      <PeerProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/liveLecture" element={<JoinLecture />} />
          <Route path="/aboutUs" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/syllabus" element={<SyllabusPage />} />
          <Route path="/StudentDashboard/quiz" element={<QuizList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ai" element={<AiAssistent />} />
          <Route path="/MainLogin" element={<MainLoginPage />} />
          <Route
            path="/StudentDashboard/dashboard"
            element={<StudentDashboard />}
          />
          <Route
            path="/StudentDashboard/announcement"
            element={<Announcement />}
          />
          <Route
            path="/StudentDashboard/assignment"
            element={<Assignment />}
          />
        </Routes>
      </PeerProvider>
    </>
  );
}

export default App;
