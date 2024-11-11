import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/SignUp.jsx";
import Navbar from "./components/Navbar.jsx";
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
