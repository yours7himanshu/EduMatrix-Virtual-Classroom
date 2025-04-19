import React from "react";
import { Search, Book } from "lucide-react";

const BookList = ({ books, searchTerm, setSearchTerm }) => {
  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by title or author..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <div className="col-span-2 py-8 text-center text-gray-500">
            No books found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

const BookCard = ({ book }) => (
  <div className="flex border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
    <div className={`${book.coverColor} w-16 flex items-center justify-center`}>
      <Book size={24} className="text-gray-700" />
    </div>
    <div className="p-4 flex-1">
      <h3 className="font-medium text-gray-900">{book.title}</h3>
      <p className="text-sm text-gray-600">by {book.author}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">{book.category} • {book.publishedYear}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          book.available 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {book.available ? "Available" : "Borrowed"}
        </span>
      </div>
      {!book.available && book.borrowedBy && (
        <p className="text-xs text-gray-500 mt-1">Currently with: {book.borrowedBy}</p>
      )}
    </div>
  </div>
);

export default BookList;