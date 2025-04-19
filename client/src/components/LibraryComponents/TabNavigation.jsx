import React from "react";
import { Search, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "browse", icon: <Search size={18} />, label: "Browse Books" },
    { name: "borrow", icon: <ArrowDownCircle size={18} />, label: "Borrow a Book" },
    { name: "return", icon: <ArrowUpCircle size={18} />, label: "Return a Book" }
  ];

  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-50 border-b">
      {tabs.map(tab => (
        <button
          key={tab.name}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            activeTab === tab.name 
              ? "bg-blue-600 text-white font-medium shadow-md" 
              : "hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab(tab.name)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;