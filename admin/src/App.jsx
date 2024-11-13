
import './App.css'
import { Routes,Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminSignUp from './pages/AdminSignUp'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddTeacher from './components/AddTeacher';
import Sidebar from './components/Sidebar';
import Announcement from './pages/Announcement';
import Students from './components/Students';

function App() {
 

  return (
    <>
    <div className="app flex ">
      <Sidebar/>
      <ToastContainer/>
  <Routes>
    <Route path='/' element={<AdminLogin/>}/>
    <Route path='/sign-up' element={<AdminSignUp/>}/>
    <Route path='/enroll-students' element={<Students/>}/>
 
    <Route path='/add-teachers' element={<AddTeacher/>}/>
    <Route path='/announcement' element={<Announcement/>}/>

  </Routes>
    </div>
    </>
  )
}

export default App
