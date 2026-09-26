
import React from 'react';
import { PlusCircle } from 'lucide-react';
import StatsCard from './StatsCard';
import RecentBooks from './RecentBooks';
import MemberActivity from './MemberActivity';
import SystemNotifications from './SystemNotifications';
import { stats } from './mockData';

const DashboardContent = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
        <div className="flex">
          <button className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-center hover:bg-indigo-700 font-medium transition shadow-xs">
            <PlusCircle size={18} className="mr-2" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index} 
            title={stat.title} 
            value={stat.value} 
            Icon={stat.icon} 
          />
        ))}
      </div>

      {/* Recent Books */}
      <RecentBooks />

      {/* Bottom Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MemberActivity />
        <SystemNotifications />
      </div>
    </div>
  );
};

export default DashboardContent;