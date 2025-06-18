
import React from 'react';
import { 
  PlusCircle, 
  Search, 
  Book,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { loans } from './mockData';

const LoansContent = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Book Loans</h2>
        <div className="flex">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <PlusCircle size={18} className="mr-2" />
            <span>Create New Loan</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
            <Search size={20} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search loans..." 
              className="bg-transparent border-none focus:outline-none ml-2 w-full"
            />
          </div>
          {/* Responsive filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button className="bg-indigo-100 text-indigo-800 px-3 py-2 sm:px-4 rounded-md text-sm sm:text-base">All Loans</button>
            <button className="bg-gray-100 text-gray-800 px-3 py-2 sm:px-4 rounded-md text-sm sm:text-base">On Time</button>
            <button className="bg-red-100 text-red-800 px-3 py-2 sm:px-4 rounded-md text-sm sm:text-base">Overdue</button>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Current Loans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]"> {/* Added min-w to ensure table content doesn't break layout before scrolling */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th> {/* Adjusted padding */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Checkout Date</th> {/* Hide on xs */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-4 py-4 whitespace-nowrap"> {/* Adjusted padding */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 rounded-lg flex items-center justify-center"> {/* Responsive size */}
                        <Book size={20} className="text-indigo-600" />
                      </div>
                      <div className="ml-2 sm:ml-4 text-sm font-medium text-gray-900">{loan.bookTitle}</div> {/* Responsive margin */}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap"> {/* Adjusted padding */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 bg-gray-100 rounded-full flex items-center justify-center"> {/* Responsive size */}
                        <User size={16} className="text-gray-600" />
                      </div>
                      <div className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-500">{loan.memberName}</div> {/* Responsive margin and text */}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell"> {/* Adjusted padding, hide on xs */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-500"> {/* Responsive text */}
                      <Calendar size={16} className="mr-2" />
                      {loan.checkoutDate}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap"> {/* Adjusted padding */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-500"> {/* Responsive text */}
                      <Clock size={16} className="mr-2" />
                      {loan.dueDate}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap"> {/* Adjusted padding */}
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      loan.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium"> {/* Adjusted padding */}
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={18} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Responsive pagination controls */}
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-700"> {/* Responsive text */}
                Showing <span className="font-medium">1</span> to <span className="font-medium">{loans.length}</span> of{' '}
                <span className="font-medium">1,254</span> loans
              </p>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-end"> {/* Responsive gap and justification */}
              <button className="px-2 py-1 sm:px-3 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700">Previous</button>
              <button className="px-2 py-1 sm:px-3 border border-indigo-500 bg-indigo-50 rounded-md text-xs sm:text-sm text-indigo-700">1</button>
              <button className="px-2 py-1 sm:px-3 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700">2</button>
              <button className="px-2 py-1 sm:px-3 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700 hidden sm:inline">3</button> {/* Hide on xs */}
              <button className="px-2 py-1 sm:px-3 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700 hidden sm:inline">...</button> {/* Hide on xs */}
              <button className="px-2 py-1 sm:px-3 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoansContent;