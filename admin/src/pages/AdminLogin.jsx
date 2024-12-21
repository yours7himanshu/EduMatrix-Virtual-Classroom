import { useState , useEffect} from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthSidebar from "../shared/AuthSidebar";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token,setToken]=useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/v2/admin-login`, {
        email,
        password,
       
      },{
        withCredentials:true,
      });

      if (response.data.success) {
        const userToken = await response.data.token;
        localStorage.setItem("token", userToken);
        console.log(response.data);
        setToken(userToken);
        toast.success(response.data.success || "Login Successful");
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("Some error occured", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Some unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(()=>{
    if(token){
      navigate('/dashboard');
    }
  },[token,navigate])

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-blue-500 to-teal-500">
      {/* Left Section with Image and Text */}
      <AuthSidebar/>

      {/* Right Section with Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-gray-50">
        <form
          className="w-full max-w-md p-8 bg-gray-100 rounded-lg shadow-lg space-y-6"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-semibold text-gray-700 text-center">Admin Login</h1>

          <div>
            <label htmlFor="email" className="block text-gray-600 font-medium mb-2">Email</label>
            <input
              id="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 font-medium mb-2">Password</label>
            <input
              id="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
           
          

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-indigo-600 text-white font-semibold rounded-md focus:outline-none hover:bg-indigo-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-indigo-600 font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
