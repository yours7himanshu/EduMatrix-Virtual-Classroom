import React, { useState, useEffect } from "react";
import { Book } from "lucide-react";
import BookList from "../../components/LibraryComponents/BookList";
import BorrowForm from "../../components/LibraryComponents/BorrowForm";
import ReturnForm from "../../components/LibraryComponents/ReturnForm";
import TabNavigation from "../../components/LibraryComponents/TabNavigation";
import Layout from "../Layout/Layout";


const Library = () => {
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");

  // Load mock data on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    // Mock data with expanded book information
    const data = [
      { 
        id: "1", 
        title: "JavaScript Essentials", 
        author: "Kyle Simpson", 
        available: true,
        coverColor: "bg-amber-100",
        category: "Programming",
        publishedYear: 2019
      },
      { 
        id: "2", 
        title: "React in Action", 
        author: "Mark Thomas", 
        available: false,
        coverColor: "bg-blue-100",
        category: "Programming",
        publishedYear: 2020,
        borrowedBy: "Alex Johnson"
      },
      { 
        id: "3", 
        title: "Clean Code", 
        author: "Robert C. Martin", 
        available: true,
        coverColor: "bg-green-100",
        category: "Software Engineering",
        publishedYear: 2008
      },
      { 
        id: "4", 
        title: "Design Patterns", 
        author: "Erich Gamma et al.", 
        available: true,
        coverColor: "bg-purple-100",
        category: "Software Engineering",
        publishedYear: 1994
      },
      { 
        id: "5", 
        title: "The Pragmatic Programmer", 
        author: "Andrew Hunt, David Thomas", 
        available: false,
        coverColor: "bg-red-100",
        category: "Software Engineering",
        publishedYear: 1999,
        borrowedBy: "Maya Rodriguez"
      }
    ];
    setBooks(data);
  };

  const handleBorrowBook = (bookData) => {
    const { title, studentName } = bookData;
    
    // Update books state to mark the book as borrowed
    const updatedBooks = books.map(book => 
      book.title.toLowerCase() === title.toLowerCase() 
        ? { ...book, available: false, borrowedBy: studentName } 
        : book
    );
    
    setBooks(updatedBooks);
    return true;
  };

  const handleReturnBook = (bookData) => {
    const { title } = bookData;
    
    // Update books state to mark the book as available
    const updatedBooks = books.map(book => 
      book.title.toLowerCase() === title.toLowerCase() 
        ? { ...book, available: true, borrowedBy: null } 
        : book
    );
    
    setBooks(updatedBooks);
    return true;
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <Book size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Library Dashboard</h1>
        </div>
        <p className="text-gray-600">Browse, borrow, and return books from our collection</p>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Navigation Tabs */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "browse" && (
            <BookList 
              books={filteredBooks} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
          )}
          
          {activeTab === "borrow" && (
            <BorrowForm 
              books={books} 
              onBorrowBook={handleBorrowBook} 
            />
          )}
          
          {activeTab === "return" && (
            <ReturnForm 
              books={books} 
              onReturnBook={handleReturnBook} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout()(Library);