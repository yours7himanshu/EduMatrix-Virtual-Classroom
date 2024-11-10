import { Routes,Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Signup from "./pages/SignUp.jsx"
function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>

    </Routes>
    </>
  )
}

export default App
