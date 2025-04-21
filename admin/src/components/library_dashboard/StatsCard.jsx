// src/components/dashboard/StatsCard.jsx

import React from 'react';

const StatsCard = ({ title, value, Icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500">{title}</h3>
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;