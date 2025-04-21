
import React from 'react';
import { 
  PlusCircle, 
  Search, 
  User,
  Mail,
  Calendar,
  Book,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { members } from './mockData';

const MembersContent = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Library Members</h2>
        <div className="flex">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <PlusCircle size={18} className="mr-2" />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-full md:w-1/2">
          <Search size={20} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="bg-transparent border-none focus:outline-none ml-2 w-full"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">All Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-gray-500 text-sm">ID: {member.id + 100000}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-500">
                      <Mail size={16} className="mr-2" />
                      {member.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-500">
                      <Book size={16} className="mr-2" />
                      {member.books}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-500">
                      <Calendar size={16} className="mr-2" />
                      {member.joined}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center">
                        <Eye size={18} />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 flex items-center">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex items-center justify-between border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{members.length}</span> of{' '}
                <span className="font-medium">3,872</span> members
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700">Previous</button>
              <button className="px-3 py-1 border border-indigo-500 bg-indigo-50 rounded-md text-sm text-indigo-700">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700">3</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700">...</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersContent;