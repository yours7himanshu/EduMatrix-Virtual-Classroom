
import './App.css'
import { Routes,Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminSignUp from './pages/AdminSignUp'

function App() {
 

  return (
    <>
    <div className="app">
  <Routes>
    <Route path='/' element={<AdminLogin/>}/>
    <Route path='/admin-signup' element={<AdminSignUp/>}/>
  </Routes>
    </div>
    </>
  )
}

export default App
