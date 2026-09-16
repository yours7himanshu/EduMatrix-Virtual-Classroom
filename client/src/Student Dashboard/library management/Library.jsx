/*
Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useEffect, useState } from "react";
import { Book } from "lucide-react";
import BookList from "../../components/LibraryComponents/BookList";
import BorrowForm from "../../components/LibraryComponents/BorrowForm";
import ReturnForm from "../../components/LibraryComponents/ReturnForm";
import TabNavigation from "../../components/LibraryComponents/TabNavigation";
import Layout from "../Layout/Layout";
import { Badge, Card, PageHeader } from "../Shared/ui";

const Library = () => {
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    const data = [
      { id: "1", title: "JavaScript Essentials", author: "Kyle Simpson", available: true, coverColor: "bg-amber-100", category: "Programming", publishedYear: 2019 },
      { id: "2", title: "React in Action", author: "Mark Thomas", available: false, coverColor: "bg-sky-100", category: "Programming", publishedYear: 2020, borrowedBy: "Alex Johnson" },
      { id: "3", title: "Clean Code", author: "Robert C. Martin", available: true, coverColor: "bg-emerald-100", category: "Software Engineering", publishedYear: 2008 },
      { id: "4", title: "Design Patterns", author: "Erich Gamma et al.", available: true, coverColor: "bg-brand-100", category: "Software Engineering", publishedYear: 1994 },
      { id: "5", title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", available: false, coverColor: "bg-rose-100", category: "Software Engineering", publishedYear: 1999, borrowedBy: "Maya Rodriguez" },
    ];
    setBooks(data);
  };

  const handleBorrowBook = (bookData) => {
    const { title, studentName } = bookData;
    setBooks((previous) =>
      previous.map((book) =>
        book.title.toLowerCase() === title.toLowerCase()
          ? { ...book, available: false, borrowedBy: studentName }
          : book
      )
    );
    return true;
  };

  const handleReturnBook = (bookData) => {
    const { title } = bookData;
    setBooks((previous) =>
      previous.map((book) =>
        book.title.toLowerCase() === title.toLowerCase()
          ? { ...book, available: true, borrowedBy: null }
          : book
      )
    );
    return true;
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCount = books.filter((book) => book.available).length;

  return (
    <div className="space-y-6">
      <PageHeader
        chip="LIBRARY" chipLabel="Borrow, return and reserve"
        title="Student library"
        description="Search the catalog, reserve textbooks for upcoming coursework and manage the loans on your account."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">{availableCount} available</Badge>
            <Badge tone="neutral" icon={Book}>
              {books.length} titles
            </Badge>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="p-5 sm:p-6">
          {activeTab === "browse" ? (
            <BookList
              books={filteredBooks}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          ) : null}

          {activeTab === "borrow" ? (
            <BorrowForm books={books} onBorrowBook={handleBorrowBook} />
          ) : null}

          {activeTab === "return" ? (
            <ReturnForm books={books} onReturnBook={handleReturnBook} />
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default Layout()(Library);