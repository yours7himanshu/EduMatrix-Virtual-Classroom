import React, { useState } from "react";
import { Book, User, ArrowUpCircle } from "lucide-react";
import FormField from "./FormField";
import StatusMessage from "./StatusMessage";

const ReturnForm = ({ books, onReturnBook }) => {
  const [returnForm, setReturnForm] = useState({ 
    studentName: "", 
    studentId: "", 
    title: "" 
  });
  const [returnMsg, setReturnMsg] = useState({ 
    text: "", 
    isError: false 
  });

  const handleReturn = () => {
    // Validate form
    if (!returnForm.title || !returnForm.studentName || !returnForm.studentId) {
      setReturnMsg({ 
        text: "Please fill all required fields", 
        isError: true 
      });
      return;
    }
    
    // Check if book exists and is borrowed
    const bookExists = books.find(b => 
      b.title.toLowerCase() === returnForm.title.toLowerCase() && !b.available
    );
    
    if (!bookExists) {
      setReturnMsg({ 
        text: "This book is not currently borrowed or doesn't exist", 
        isError: true 
      });
      return;
    }
    
    // Process returning
    const success = onReturnBook(returnForm);
    
    if (success) {
      setReturnMsg({ 
        text: `Book "${returnForm.title}" returned successfully by ${returnForm.studentName}`,
        isError: false 
      });
      setReturnForm({ studentName: "", studentId: "", title: "" });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-4">
        <FormField
          label="Student Name"
          placeholder="Enter your full name"
          value={returnForm.studentName}
          onChange={(e) => setReturnForm({ ...returnForm, studentName: e.target.value })}
          icon={<User size={18} />}
        />
        <FormField
          label="Student ID"
          placeholder="Enter your student ID"
          value={returnForm.studentId}
          onChange={(e) => setReturnForm({ ...returnForm, studentId: e.target.value })}
          icon={<div className="text-xs font-bold">ID</div>}
        />
        <FormField
          label="Book Title"
          placeholder="Enter the exact book title"
          value={returnForm.title}
          onChange={(e) => setReturnForm({ ...returnForm, title: e.target.value })}
          icon={<Book size={18} />}
        />
        <div className="pt-2">
          <button
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
            onClick={handleReturn}
          >
            <ArrowUpCircle size={18} />
            <span>Return Book</span>
          </button>
        </div>
        <StatusMessage message={returnMsg} isError={returnMsg.isError} />
      </div>
    </div>
  );
};

export default ReturnForm;