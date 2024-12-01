import Signup from "./pages/SignUp.jsx";
import Navbar from "./components/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home.jsx";
import JoinLecture from "./components/JoinLectures.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import Card from '@mui/material/Card';
 import CardContent from '@mui/material/CardContent';
  import Typography from '@mui/material/Typography';
   import Button from '@mui/material/Button'; 
   import CardActions from '@mui/material/CardActions';
import NotesPage from "./pages/NotesPage.jsx";
import SyllabusPage from "./pages/SyllabusPage.jsx";
import QuizList from "./components/QuizList.jsx";
import Login  from "./pages/Login.jsx"

import MainLoginPage from "./pages/MainLoginPage.jsx";

import Announcement from "./components/Announcement.jsx";

function App() {
  return (
    <>
      <Navbar />
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/liveLecture" element={<JoinLecture />} />
        <Route path="/aboutUs" element={<AboutPage/>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/courses" element={<CoursesPage/>} />
        <Route path="/notes" element={<NotesPage/>} />
        <Route path="/syllabus" element={<SyllabusPage/>} />
        <Route path="/quiz" element={<QuizList/>} />
        <Route path="/login" element={<Login/>} />

        <Route path="/MainLogin" element={<MainLoginPage/>}/>
        
        <Route path="/displayAnnoncement"element={<Announcement/>}/>

      </Routes>
    </>
  );
}

export default App;
