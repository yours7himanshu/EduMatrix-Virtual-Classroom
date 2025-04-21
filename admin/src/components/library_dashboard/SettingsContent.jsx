

import React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Mail, 
  Globe, 
  Database, 
  HardDrive,
  Save
} from 'lucide-react';

const SettingsContent = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Library Configuration</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* General Settings */}
            <div>
              <h4 className="text-md font-medium mb-4 flex items-center">
                <Globe size={18} className="mr-2 text-indigo-600" />
                General Settings
              </h4>
              <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Library Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="Central City Library"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="contact@citylibrary.org"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Loan Period (days)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="21"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Books Per Member
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="5"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h4 className="text-md font-medium mb-4 flex items-center">
                <Bell size={18} className="mr-2 text-indigo-600" />
                Notification Settings
              </h4>
              <div className="ml-7 space-y-4">
                <div className="flex items-center">
                  <input
                    id="due-reminders"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="due-reminders" className="ml-2 block text-sm text-gray-700">
                    Send due date reminders to members
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="overdue-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="overdue-notifications" className="ml-2 block text-sm text-gray-700">
                    Send overdue notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="new-arrivals"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="new-arrivals" className="ml-2 block text-sm text-gray-700">
                    Notify members about new arrivals
                  </label>
                </div>
              </div>
            </div>

            {/* Database Settings */}
            <div>
              <h4 className="text-md font-medium mb-4 flex items-center">
                <Database size={18} className="mr-2 text-indigo-600" />
                Database & Backup
              </h4>
              <div className="ml-7 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Storage
                  </label>
                  <div className="flex items-center space-x-2">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
                      <HardDrive size={16} className="mr-2" />
                      <span>Run Backup Now</span>
                    </button>
                    <span className="text-sm text-gray-500">Last backup: April 19, 2025 at 11:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Account */}
            <div>
              <h4 className="text-md font-medium mb-4 flex items-center">
                <User size={18} className="mr-2 text-indigo-600" />
                Administrator Account
              </h4>
              <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="Sarah Johnson"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="sarah.j@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Change Password
                  </label>
                  <div className="flex items-center space-x-2">
                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center">
                      <Lock size={16} className="mr-2" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
                <Save size={18} className="mr-2" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;