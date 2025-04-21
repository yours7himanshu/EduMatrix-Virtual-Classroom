
import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import photo1 from './photo1.jpg';

const TopNav = () => {
  return (
    <div className="bg-white shadow p-4 flex items-center justify-between">
      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-64">
        <Search size={20} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none focus:outline-none ml-2 w-full"
        />
      </div>
      <div className="flex items-center">
        <button className="relative p-2 mr-4">
          <Bell size={20} />
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex items-center">
          <img 
            src={photo1}
            alt="Admin" 
            className="w-8 h-8 rounded-full mr-2" 
          />
          <span className="mr-2">Sarah Johnson</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default TopNav;