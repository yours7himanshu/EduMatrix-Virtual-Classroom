
import React from 'react';
import { memberActivities } from './mockData';

const MemberActivity = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Members Activity</h3>
      <div className="space-y-4">
        {memberActivities.map(activity => (
          <div key={activity.id} className="flex items-center">
         
            <div>
              <p className="font-medium">
                {activity.name} {activity.action} "{activity.book}"
              </p>
              <p className="text-gray-500 text-sm">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberActivity;