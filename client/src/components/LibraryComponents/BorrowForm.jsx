import React, { useState } from "react";
import { Book, User, ArrowDownCircle, AlertCircle } from "lucide-react";
import FormField from "./FormField";
import StatusMessage from "./StatusMessage";

const BorrowForm = ({ books, onBorrowBook }) => {
  const [borrowForm, setBorrowForm] = useState({ 
    studentName: "", 
    studentId: "", 
    title: "" 
  });
  const [borrowMsg, setBorrowMsg] = useState({ 
    text: "", 
    isError: false 
  });

  const handleBorrow = () => {
    // Validate form
    if (!borrowForm.title || !borrowForm.studentName || !borrowForm.studentId) {
      setBorrowMsg({ 
        text: "Please fill all required fields", 
        isError: true 
      });
      return;
    }
    
    // Check if book exists and is available
    const bookExists = books.find(b => 
      b.title.toLowerCase() === borrowForm.title.toLowerCase() && b.available
    );
    
    if (!bookExists) {
      setBorrowMsg({ 
        text: "This book is not available for borrowing", 
        isError: true 
      });
      return;
    }
    
    // Process borrowing
    const success = onBorrowBook(borrowForm);
    
    if (success) {
      setBorrowMsg({ 
        text: `Book "${borrowForm.title}" borrowed successfully by ${borrowForm.studentName}`,
        isError: false 
      });
      setBorrowForm({ studentName: "", studentId: "", title: "" });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-4">
        <FormField
          label="Student Name"
          placeholder="Enter your full name"
          value={borrowForm.studentName}
          onChange={(e) => setBorrowForm({ ...borrowForm, studentName: e.target.value })}
          icon={<User size={18} />}
        />
        <FormField
          label="Student ID"
          placeholder="Enter your student ID"
          value={borrowForm.studentId}
          onChange={(e) => setBorrowForm({ ...borrowForm, studentId: e.target.value })}
          icon={<div className="text-xs font-bold">ID</div>}
        />
        <FormField
          label="Book Title"
          placeholder="Enter the exact book title"
          value={borrowForm.title}
          onChange={(e) => setBorrowForm({ ...borrowForm, title: e.target.value })}
          icon={<Book size={18} />}
        />
        <div className="pt-2">
          <button
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
            onClick={handleBorrow}
          >
            <ArrowDownCircle size={18} />
            <span>Borrow Book</span>
          </button>
        </div>
        <StatusMessage message={borrowMsg} isError={borrowMsg.isError} />
      </div>
    </div>
  );
};

export default BorrowForm;