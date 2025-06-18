
import React from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react'; // Added Menu
import photo1 from './photo1.jpg';

const TopNav = ({ toggleSidebar }) => { // Added toggleSidebar prop
  return (
    <div className="bg-white shadow px-2 py-3 sm:px-4 sm:py-3 flex items-center justify-between sticky top-0 z-10"> {/* Adjusted padding, added sticky and z-index */}
      {/* Hamburger menu - visible on mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 mr-1 sm:mr-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <Menu size={24} />
      </button>

      {/* Search Input - responsive width */}
      <div className="flex items-center bg-gray-100 px-2 sm:px-4 py-2 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md"> {/* Responsive max-width, w-full takes available space */}
        <Search size={20} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm sm:text-base" /* Responsive text */
        />
      </div>
      <div className="flex items-center">
        <button className="relative p-2 mr-1 sm:mr-4"> {/* Responsive margin */}
          <Bell size={20} />
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3 h-3 sm:w-4 sm:h-4 text-xs flex items-center justify-center"> {/* Responsive badge size */}
            3
          </span>
        </button>
        <div className="flex items-center">
          <img 
            src={photo1}
            alt="Admin" 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-1 sm:mr-2"  /* Responsive image size and margin */
          />
          <span className="mr-1 sm:mr-2 hidden sm:inline text-sm sm:text-base">Sarah Johnson</span> {/* Hidden on xs, responsive text */}
          <ChevronDown size={16} className="hidden sm:block" /> {/* Hidden on xs */}
        </div>
      </div>
    </div>
  );
};

export default TopNav;