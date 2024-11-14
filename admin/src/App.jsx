
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
import Dashboard from './components/Dashboard';
import TimeTable from './components/TimeTable';
import Classes from './components/Classes';
import CreateLecture from './components/CreateLecture';

function App() {
 

  return (
    <>
    <div className="app  ">
      
      <ToastContainer/>
  <Routes>
    <Route path='/' element={<AdminLogin/>}/>
    <Route path='/sign-up' element={<AdminSignUp/>}/>
    <Route path='/enroll-students' element={<Students/>}/>
 <Route path='/dashboard' element={<Dashboard/>}/>
    <Route path='/add-teachers' element={<AddTeacher/>}/>
    <Route path='/announcement' element={<Announcement/>}/>
    <Route path='/timetable' element={<TimeTable/>}/>
<Route path='/classes' element={<Classes/>}/>
<Route path='/createLecture' element={<CreateLecture/>}/>

  </Routes>
    </div>
    </>
  )
}

export default App
