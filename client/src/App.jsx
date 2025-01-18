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
import Navbar from "./components/Navbar/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import JoinLecture from "./components/JoinLectures.jsx";
import AboutPage from "./pages/About/AboutPage.jsx";
import ContactPage from "./pages/Contact/ContactPage.jsx";
import CoursesPage from "./pages/Courses/CoursesPage.jsx";
import Card from '@mui/material/Card';
 import CardContent from '@mui/material/CardContent';
  import Typography from '@mui/material/Typography';
   import Button from '@mui/material/Button'; 
   import CardActions from '@mui/material/CardActions';
import NotesPage from "./pages/Notes/NotesPage.jsx";
import SyllabusPage from "./pages/Syllabus/SyllabusPage.jsx";
import QuizList from "./components/Quiz/QuizList.jsx";
import Login  from "./pages/Auth/Login.jsx"
import { PeerProvider } from "./providers/Peer.jsx";
import MainLoginPage from "./pages/Auth/MainLoginPage.jsx";

import Announcement from "./components/Announcement/Announcement.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import AiAssistent from "./components/AI Powered Assistant/AiAssistent.jsx";
import Modal from "./Modal/Modal.jsx";
import StudentDashboard from "./Student Dashboard/Dashboard/StudentDashboard.jsx";
// import ModalComponent from "./Modal/ModalComponent.jsx";

function App() {
  return (
    <>
      {/* <Navbar /> */}

      <ToastContainer/>
      <PeerProvider>

      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/liveLecture" element={<JoinLecture />} />
        <Route path="/aboutUs" element={<AboutPage/>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/courses" element={<CoursesPage/>} />
        <Route path="/notes" element={<NotesPage/>} />
        <Route path="/syllabus" element={<SyllabusPage/>} />
        <Route path="/quiz" element={<QuizList/>} />
        <Route path="/login" element={<Login/>} />
<Route path="/ai" element={<AiAssistent/>}/>
        <Route path="/MainLogin" element={<MainLoginPage/>}/>
        <Route path="/StudentDashboard/dashboard" element={<StudentDashboard/>}/>
        <Route path="/displayAnnoncement"element={<Announcement/>}/>

      </Routes>
      </PeerProvider>
    </>
  );
}

export default App;
