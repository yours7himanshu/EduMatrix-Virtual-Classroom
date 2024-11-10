import { Routes,Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Signup from "./pages/SignUp.jsx"
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
function App() {
  

  return (
    <>
    <div className="app">
      <ToastContainer/>
    <Routes>
      <Route path="/" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>

    </Routes>
  
    </div>
    </>
  )
}

export default App
