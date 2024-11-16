import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import profilePic from "../assets/pp.png";
import dropdown from "../assets/dropdown.png";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-violet-600 text-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-semibold">
          <Link to="/">EduMatrix</Link>
        </div>

        {/* Links */}
        {isAuthenticated && (
          <div className="hidden md:flex space-x-6">
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
            <Link to="/notes" className="hover:text-blue-300">
              Notes
            </Link>
            <Link to="/syllabus" className="hover:text-blue-300">
              Syllabus
            </Link>
          </div>
        )}

        {/* Profile or Login/Signup */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
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
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-green-500 text-white px-8 py-3 rounded-full font-light hidden md:block"
            >
              Create Account
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
