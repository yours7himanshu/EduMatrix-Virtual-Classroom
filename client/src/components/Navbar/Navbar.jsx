
// Copyright 2024 Himanshu Dinkar
/*
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


import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// import profilePic from "../../assets/pp.png";
// import dropdown from "../../assets/dropdown.png";

const Navbar = () => {
  // const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-950 fixed top-0 left-0 w-full z-50 h-[11%] text-white max-md:shadow-sm shadow-lg p-3">
      <div className="container mx-auto max-md:m-2 flex justify-between items-center">
        {/* Logo */}
        <div className="text-3xl ml-3 max-md:ml-0 max-md:text-3xl flex items-center gap-2 font-extrabold">
        <img className="rounded-md object-cover   h-11" src="/logo/E.png" alt="" />
          <Link className="text-gray-300" to="/">EduMatrix</Link>
        </div>

        {/* Links */}
       
          <div className="hidden md:flex mr-11 ml-5 space-x-6 border border-gray-700 outline-none rounded-md px-5 py-3">
            <Link to="/" className="hover:text-blue-300">
              Home
            </Link>
            <Link to="/aboutUs" className="hover:text-blue-300">
              About Us
            </Link>
            <Link to="/courses" className="hover:text-blue-300">
              Courses
            </Link>
            <Link to="/contact" className="hover:text-blue-300">
              Contact Us
            </Link>
            {/* <Link to="/notes" className="hover:text-blue-300">
              Notes
            </Link>
            <Link to="/syllabus" className="hover:text-blue-300">
              Syllabus
            </Link> */}
          </div>
   

        {/* Profile or Login/Signup */}
        <div className="flex items-center justify-center gap-4">
          {/* {isAuthenticated ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img className="w-8 rounded-full" src={profilePic} alt="Profile" />
              <img className="w-2.5" src={dropdown} alt="Dropdown Icon" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-grey-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-gray-500 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("/my-courses")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Courses
                  </p>
                  <p
                    onClick={logout}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                  <p
                    onClick={() => navigate("/profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                </div>
              </div>
            </div>
          ) : ( */}
            <button
              onClick={()=> navigate("/MainLogin")}
              className="bg-zinc-200 mr-3 max-md:mr-0 font-medium text-black px-5 py-3 rounded-md  max-md:px-2  max-md:text-sm  "
            >
              Create Account
            </button>
          {/* )} */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
