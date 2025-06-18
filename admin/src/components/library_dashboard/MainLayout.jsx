
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import DashboardContent from './DashboardContent';
import BooksContent from './BooksContent';
import MembersContent from './MembersContent';
import LoansContent from './LoansContent';
import SettingsContent from './SettingsContent';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar closed by default on mobile

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'books':
        return <BooksContent />;
      case 'members':
        return <MembersContent />;
      case 'loans':
        return <LoansContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} />
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-1 flex flex-col overflow-y-auto md:ml-64"> {/* Added md:ml-64 for desktop sidebar, flex flex-col */}
        <TopNav toggleSidebar={toggleSidebar} />
        <div className="flex-grow p-0 md:p-0"> {/* Adjusted padding, content components will have their own */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;