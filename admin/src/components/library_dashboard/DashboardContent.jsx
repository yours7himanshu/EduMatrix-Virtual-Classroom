
import React from 'react';
import { PlusCircle } from 'lucide-react';
import StatsCard from './StatsCard';
import RecentBooks from './RecentBooks';
import MemberActivity from './MemberActivity';
import SystemNotifications from './SystemNotifications';
import { stats } from './mockData';

const DashboardContent = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="flex">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <PlusCircle size={18} className="mr-2" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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