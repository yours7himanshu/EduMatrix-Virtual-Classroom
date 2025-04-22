
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

  return (
    <div className="w-64 bg-indigo-800 text-white h-full">
      <div className="p-6 flex items-center">
        <Library size={24} className="mr-2" />
        <h1 className="text-2xl font-bold">LibraryAdmin</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map(item => (
          <div 
            key={item.id}
            className={`flex items-center px-6 py-3 cursor-pointer ${
              activeTab === item.id ? 'bg-indigo-900' : 'hover:bg-indigo-700'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} className="mr-3" />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;