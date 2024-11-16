import axios from 'axios';
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';



function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { token, setToken } = useAuth();

  const handleSubmit = async(e) => {
    e.preventDefault();

    try{
    const response = await axios.post(`${backendUrl}/api/v1/login`,{
      email,
      password
    });
    
    if(response.data.success){
      const userToken  = response.data.token;
      setToken(userToken);
      localStorage.setItem('token',userToken);
      toast.success("Login Successfully");
      navigate('/')

    }
    }
    catch(error){
      console.log("Some Error Occcured",error);
      toast.error("Internal Server Error");
    }
  
  }
useEffect(()=>{
  if(token){
    navigate('/');
  }
},[token,navigate]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-4">
        
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          
          <h1 className="text-3xl font-semibold text-center mb-8">
            Student Portal Login
          </h1>

         
          <form onSubmit={handleSubmit} className="space-y-4">
          
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                placeholder="College ID or Email"
              />
            </div>

           
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                placeholder="Password"
              />
            </div>

           
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600"
            >
              Log In
            </button>


            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

  
            <div className="text-center">
              <a href="#" className="text-sm text-blue-900">
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-center">
            Don not have an account?{' '}
            <Link to="/signup" className="text-blue-500 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

