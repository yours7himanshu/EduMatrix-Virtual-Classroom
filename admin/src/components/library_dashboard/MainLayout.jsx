
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto">
        <TopNav />
        {renderContent()}
      </div>
    </div>
  );
};

export default MainLayout;