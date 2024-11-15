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
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import NotesPage from "./pages/NotesPage.jsx";
import SyllabusPage from "./pages/SyllabusPage.jsx";
import QuizList from "./components/QuizList.jsx";
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




      </Routes>
    </>
  );
}

export default App;
