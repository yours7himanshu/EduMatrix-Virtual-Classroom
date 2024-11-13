
import './App.css'
import { Routes,Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminSignUp from './pages/AdminSignUp'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';

function App() {
 

  return (
    <>
    <div className="app">
      <ToastContainer/>
  <Routes>
    <Route path='/' element={<AdminLogin/>}/>
    <Route path='/sign-up' element={<AdminSignUp/>}/>
    <Route path='/home' element={<Home/>}/>
    



  </Routes>
    </div>
    </>
  )
}

export default App
