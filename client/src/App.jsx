import Signup from "./pages/SignUp.jsx";
import Navbar from "./components/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home.jsx";
import JoinLecture from "./components/JoinLectures.jsx";
function App() {
  return (
    <>
      <Navbar />
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/liveLecture" element={<JoinLecture />} />

      </Routes>
    </>
  );
}

export default App;
