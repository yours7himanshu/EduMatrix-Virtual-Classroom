
import React from 'react';
import { Bell } from 'lucide-react';
import { systemNotifications } from './mockData';

const SystemNotifications = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">System Notifications</h3>
      <div className="space-y-4">
        {systemNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-3 bg-${notification.color}-50 border-l-4 border-${notification.color}-400 rounded`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 text-${notification.color}-400`}>
                <Bell size={20} />
              </div>
              <div className="ml-3">
                <p className={`text-sm text-${notification.color}-700`}>{notification.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemNotifications;