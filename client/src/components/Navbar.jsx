import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import profilePic from '../assets/pp.png';
import dropdown from '../assets/dropdown.png';


const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-teal-600 text-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-semibold">
          <Link to="/">Smart Education</Link>
        </div>

        {/* Desktop Links */}
        <div className={`hidden md:flex space-x-6`}>
          <Link to="/" className="hover:text-blue-300">Home</Link>
          <Link to="/courses" className="hover:text-blue-300">Courses</Link>
          <Link to="/assignments" className="hover:text-blue-300">Assignments</Link>
          <Link to="/profile" className="hover:text-blue-300">Profile</Link>
          <Link to="/contact" className="hover:text-blue-300">Contact</Link>
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-teal-700 p-4 flex flex-col space-y-2">
            <Link to="/" className="hover:text-blue-300">Home</Link>
            <Link to="/courses" className="hover:text-blue-300">Courses</Link>
            <Link to="/assignments" className="hover:text-blue-300">Assignments</Link>
            <Link to="/profile" className="hover:text-blue-300">Profile</Link>
            <Link to="/contact" className="hover:text-blue-300">Contact</Link>
          </div>
        )}

        {/* Profile or Create Account Button */}
        <div className="flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img className="w-8 rounded-full" src={profilePic}  alt="Profile" />
              <img className="w-2.5" src={dropdown} alt="Dropdown Icon" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-grey-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-gray-500 rounded flex flex-col gap-4 p-4">
                  <p onClick={() => navigate('/login')} className="hover:text-black cursor-pointer">My Courses</p>
                  <p onClick={() => setToken(false)} className="hover:text-black cursor-pointer">Logout</p>
                  <p onClick={() => navigate('/login')} className="hover:text-black cursor-pointer">My Profile</p>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="bg-green-500 text-white px-8 py-3 rounded-full font-light hidden md:block">Create Account</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
