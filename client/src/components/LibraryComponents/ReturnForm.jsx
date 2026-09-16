import React, { useState } from "react";
import { Book, ArrowUpCircle, Hash, User } from "lucide-react";
import FormField from "./FormField";
import StatusMessage from "./StatusMessage";
import { Button } from "../../Student Dashboard/Shared/ui";

const ReturnForm = ({ books, onReturnBook }) => {
  const [returnForm, setReturnForm] = useState({
    studentName: "",
    studentId: "",
    title: "",
  });
  const [returnMsg, setReturnMsg] = useState({ text: "", isError: false });

  const handleReturn = () => {
    if (!returnForm.title || !returnForm.studentName || !returnForm.studentId) {
      setReturnMsg({ text: "Please fill all required fields.", isError: true });
      return;
    }

    const bookExists = books.find(
      (b) => b.title.toLowerCase() === returnForm.title.toLowerCase() && !b.available
    );

    if (!bookExists) {
      setReturnMsg({
        text: "This book is not currently on loan, or it does not exist in the catalog.",
        isError: true,
      });
      return;
    }

    const success = onReturnBook(returnForm);

    if (success) {
      setReturnMsg({
        text: `“${returnForm.title}” was returned successfully by ${returnForm.studentName}.`,
        isError: false,
      });
      setReturnForm({ studentName: "", studentId: "", title: "" });
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-5">
        <h3 className="font-display text-[15px] font-bold text-ink-900">
          Return a book
        </h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
          Returned titles are released back to the catalog and cleared from your
          loan list immediately.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          id="return-name"
          label="Student name"
          placeholder="Enter your full name"
          value={returnForm.studentName}
          onChange={(event) =>
            setReturnForm({ ...returnForm, studentName: event.target.value })
          }
          icon={<User size={16} />}
        />
        <FormField
          id="return-id"
          label="Student ID"
          placeholder="Enter your student ID"
          value={returnForm.studentId}
          onChange={(event) =>
            setReturnForm({ ...returnForm, studentId: event.target.value })
          }
          icon={<Hash size={16} />}
        />
        <FormField
          id="return-title"
          label="Book title"
          placeholder="Enter the exact book title"
          value={returnForm.title}
          onChange={(event) =>
            setReturnForm({ ...returnForm, title: event.target.value })
          }
          icon={<Book size={16} />}
        />

        <Button className="w-full" onClick={handleReturn}>
          <ArrowUpCircle size={15} />
          Confirm return
        </Button>

        <StatusMessage message={returnMsg} />
      </div>
    </div>
  );
};

export default ReturnForm;