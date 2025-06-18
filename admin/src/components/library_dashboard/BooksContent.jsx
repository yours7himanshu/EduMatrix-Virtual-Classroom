import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown,
  Book,
  Bookmark,
  Trash2,
  Edit
} from 'lucide-react';
import { recentBooks, categories, popularBooks } from './mockData';

const BooksContent = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter books based on search query and selected category
  const filteredBooks = recentBooks.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filter === 'all' || book.category === filter;
    return matchesSearch && matchesCategory;
  });

  console.log("Filtered Books:", filteredBooks); // Debugging line

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Books Management</h2>
        <div className="flex">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
            <PlusCircle size={18} className="mr-2" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
            <Search size={20} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search books..." 
              className="bg-transparent border-none focus:outline-none ml-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex">
            <div className="relative w-full">
              <select 
                className="appearance-none bg-gray-100 border-none w-full py-2 px-4 pr-8 rounded-lg"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="science">Science</option>
                <option value="history">History</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Filter size={18} />
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="relative w-full">
              <select className="appearance-none bg-gray-100 border-none w-full py-2 px-4 pr-8 rounded-lg">
                <option>Latest Added</option>
                <option>Title A-Z</option>
                <option>Title Z-A</option>
                <option>Author A-Z</option>
                <option>Most Popular</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ArrowUpDown size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Books Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Book Collection</h3>
              <span className="text-gray-500">Showing {filteredBooks.length} books</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]"> {/* Added min-w-[640px] */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Book size={20} className="text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{book.title}</div>
                            <div className="text-gray-500 text-sm">{book.id < 5 ? "Added recently" : `ISBN: 978-${Math.floor(Math.random() * 10000000000)}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{book.author}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          book.status === 'Available' ? 'bg-green-100 text-green-800' : 
                          book.status === 'Checked Out' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                            <Edit size={18} />
                          </button>
                          <button className="text-green-600 hover:text-green-900 flex items-center">
                            <Bookmark size={18} />
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
            </div>
          </div>
        </div>
        
        {/* Sidebar Statistics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Categories</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {categories.map(category => (
                  <li key={category.id} className="flex justify-between items-center">
                    <span className="text-gray-700">{category.name}</span>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Popular Books */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Popular Books</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                {popularBooks.map(book => (
                  <li key={book.id} className="flex items-center">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Book size={20} className="text-indigo-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.checkouts} checkouts</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksContent;
