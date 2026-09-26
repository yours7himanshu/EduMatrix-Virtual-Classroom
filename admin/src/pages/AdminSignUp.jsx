
/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Link } from "react-router-dom";
import {  useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AuthSidebar from "../shared/AuthSidebar";
import clsx from 'clsx';

function AdminSignUp() {
  const [collegeName,setCollegeName]=useState('');
  const [directorName, setDirectorName] = useState("");
  const [errors,setErrors]=useState("");
  const [email, setEmail] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/v2/admin-register`, {
        collegeName,
        directorName,
        email,
        centerCode,
        role,
        password,
      });
      if (response.data.success) {
        toast.success(
          response.data.message || "College successfully registered"
        );
        navigate("/");
      }
    } catch (error) {
      console.log("Some error occurred", error);
      if (error.response?.data?.message)
         {
        setErrors(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setErrors(error.response.data.message);
        toast.error("Some unexpected error occurred...Try Again!!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
     <AuthSidebar/>

      {/* Right Section: Form */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 sm:p-8">
        {errors && (
          <div className="border border-red-200 flex items-center justify-center p-3 w-full max-w-md text-red-700 rounded-xl mb-4 bg-red-50 text-sm font-semibold text-center">
            {errors}
          </div>
        )}
        <form
          className="w-full max-w-md p-5 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-3.5"
          onSubmit={handleSubmit}
        >
          <div className="text-center mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Admin Register
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create an institute administration account
            </p>
          </div>

          {/* Input Fields */}
          <input
            type="text"
            className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-xs"
            placeholder="College Name"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            required
          />
          <input
            type="text"
            className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-xs"
            placeholder="Director Name"
            value={directorName}
            onChange={(e) => setDirectorName(e.target.value)}
            required
          />
          <input
            type="text"
            className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-xs"
            placeholder="Center Code"
            value={centerCode}
            onChange={(e) => setCenterCode(e.target.value)}
            required
          />
          <input
            type="email"
            className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-xs"
            placeholder="College Administration Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="border border-gray-300 h-11 w-full px-3.5 text-sm sm:text-base rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-xs"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-gray-700 font-semibold text-xs sm:text-sm mb-1"
            >
              Choose Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition shadow-xs"
            >
              <option value="choose">Choose your role</option>
              <option value="Registrar">Registrar</option>
              <option value="Director">Director</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold w-full py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer text-base mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Link to Login */}
          <p className="pt-2 text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminSignUp;
