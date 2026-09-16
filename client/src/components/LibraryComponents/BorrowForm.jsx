import React, { useState } from "react";
import { Book, ArrowDownCircle, Hash, User } from "lucide-react";
import FormField from "./FormField";
import StatusMessage from "./StatusMessage";
import { Button } from "../../Student Dashboard/Shared/ui";

const BorrowForm = ({ books, onBorrowBook }) => {
  const [borrowForm, setBorrowForm] = useState({
    studentName: "",
    studentId: "",
    title: "",
  });
  const [borrowMsg, setBorrowMsg] = useState({ text: "", isError: false });

  const handleBorrow = () => {
    if (!borrowForm.title || !borrowForm.studentName || !borrowForm.studentId) {
      setBorrowMsg({ text: "Please fill all required fields.", isError: true });
      return;
    }

    const bookExists = books.find(
      (b) => b.title.toLowerCase() === borrowForm.title.toLowerCase() && b.available
    );

    if (!bookExists) {
      setBorrowMsg({
        text: "This book is not available for borrowing.",
        isError: true,
      });
      return;
    }

    const success = onBorrowBook(borrowForm);

    if (success) {
      setBorrowMsg({
        text: `“${borrowForm.title}” was borrowed successfully by ${borrowForm.studentName}.`,
        isError: false,
      });
      setBorrowForm({ studentName: "", studentId: "", title: "" });
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-5">
        <h3 className="font-display text-[15px] font-bold text-ink-900">
          Borrow a book
        </h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
          Enter the exact catalog title. Active loans are recorded against your
          student ID.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          id="borrow-name"
          label="Student name"
          placeholder="Enter your full name"
          value={borrowForm.studentName}
          onChange={(event) =>
            setBorrowForm({ ...borrowForm, studentName: event.target.value })
          }
          icon={<User size={16} />}
        />
        <FormField
          id="borrow-id"
          label="Student ID"
          placeholder="Enter your student ID"
          value={borrowForm.studentId}
          onChange={(event) =>
            setBorrowForm({ ...borrowForm, studentId: event.target.value })
          }
          icon={<Hash size={16} />}
        />
        <FormField
          id="borrow-title"
          label="Book title"
          placeholder="Enter the exact book title"
          value={borrowForm.title}
          onChange={(event) =>
            setBorrowForm({ ...borrowForm, title: event.target.value })
          }
          icon={<Book size={16} />}
        />

        <Button className="w-full" onClick={handleBorrow}>
          <ArrowDownCircle size={15} />
          Confirm borrow
        </Button>

        <StatusMessage message={borrowMsg} />
      </div>
    </div>
  );
};

export default BorrowForm;