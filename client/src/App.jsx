import Signup from "./pages/Auth/SignUp.jsx";
import Navbar from "./components/Navbar.jsx";
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
import QuizList from "./components/QuizList.jsx";
import Login  from "./pages/Auth/Login.jsx"
import { PeerProvider } from "./providers/Peer.jsx";
import MainLoginPage from "./pages/Auth/MainLoginPage.jsx";

import Announcement from "./components/Announcement.jsx";
import HomePage from "./pages/Home/HomePage.jsx";

function App() {
  return (
    <>
      <Navbar />
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

        <Route path="/MainLogin" element={<MainLoginPage/>}/>
        
        <Route path="/displayAnnoncement"element={<Announcement/>}/>

      </Routes>
      </PeerProvider>
    </>
  );
}

export default App;
