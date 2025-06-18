
import React from 'react';
import { 
  Book, 
  Users, 
  Bookmark,
  BarChart2,
  Settings,
  Library
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'books', label: 'Books', icon: Book },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'loans', label: 'Loans', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // isOpen will be passed as a prop to control visibility on mobile
  // For desktop, it can be always visible based on screen size classes
  return (
    <div
      className={`w-64 bg-indigo-800 text-white h-full transition-transform duration-300 ease-in-out
                  fixed md:relative md:translate-x-0 z-30
                  ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-6 flex items-center">
        <Library size={24} className="mr-2" />
        <h1 className="text-xl lg:text-2xl font-bold">LibraryAdmin</h1> {/* Responsive text size */}
      </div>
      <nav className="mt-6">
        {menuItems.map(item => (
          <div 
            key={item.id}
            className={`flex items-center px-4 py-3 lg:px-6 cursor-pointer rounded-md mx-2 ${ // Added mx-2 and rounded-md
              activeTab === item.id ? 'bg-indigo-900' : 'hover:bg-indigo-700'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} className="mr-3" />
            <span className="text-sm lg:text-base">{item.label}</span> {/* Responsive text size */}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;