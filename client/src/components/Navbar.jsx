
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-violet-700 text-white shadow-md p-4">
      <div className="container mx-auto flex justify-evenly items-center">
        {/* Logo */}
        <div className="text-2xl font-semibold">
          <Link to="/">Smart Education</Link>
        </div>
        
       
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-blue-300">Home</Link>
          <Link to="/courses" className="hover:text-blue-300">Courses</Link>
          <Link to="/assignments" className="hover:text-blue-300">Assignments</Link>
          <Link to="/profile" className="hover:text-blue-300">Profile</Link>
          <Link to="/contact" className="hover:text-blue-300">Contact</Link>
        </div>
        
       
        <div className="md:hidden">
          <button className="text-white focus:outline-none" id="menu-toggle">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
