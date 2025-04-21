
import { Book, Users, Clock, Calendar } from 'lucide-react';

export const recentBooks = [
  { id: 1, title: "The Midnight Library", author: "Matt Haig", status: "Checked Out", due: "May 3, 2025" },
  { id: 2, title: "Project Hail Mary", author: "Andy Weir", status: "Available", due: null },
  { id: 3, title: "Atomic Habits", author: "James Clear", status: "Reserved", due: "April 25, 2025" },
  { id: 4, title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", status: "Checked Out", due: "April 29, 2025" },
  { id: 5, title: "Dune", author: "Frank Herbert", status: "Available", due: null },
  { id: 6, title: "The Song of Achilles", author: "Madeline Miller", status: "Checked Out", due: "May 5, 2025" },
  { id: 7, title: "Klara and the Sun", author: "Kazuo Ishiguro", status: "Available", due: null },
  { id: 8, title: "A Gentleman in Moscow", author: "Amor Towles", status: "Reserved", due: "April 28, 2025" }
];



export const memberActivities = [
  {
    id: 1,
    name: "Emma Wilson",
    action: "checked out",
    book: "Project Hail Mary",
    timestamp: "Today at 10:45 AM"
  },
  {
    id: 2,
    name: "Michael Brown",
    action: "returned",
    book: "The Alchemist",
    timestamp: "Yesterday at 3:20 PM"
  },
  {
    id: 3,
    name: "Lucas Martinez",
    action: "reserved",
    book: "Dune",
    timestamp: "April 19, 2025 at 2:15 PM"
  },
  {
    id: 4,
    name: "Sarah Johnson",
    action: "renewed",
    book: "To Kill a Mockingbird",
    timestamp: "April 18, 2025 at 9:30 AM"
  }
];

export const systemNotifications = [
  {
    id: 1,
    type: "warning",
    message: "15 books are due for return today",
    color: "yellow"
  },
  {
    id: 2,
    type: "success",
    message: "New book shipment received successfully",
    color: "green"
  },
  {
    id: 3,
    type: "info",
    message: "System update scheduled for tonight at 2:00 AM",
    color: "blue"
  }
];

export const stats = [
  { title: "Total Books", value: "24,583", icon: Book },
  { title: "Active Members", value: "3,872", icon: Users },
  { title: "Books Checked Out", value: "1,254", icon: Clock },
  { title: "New Registrations", value: "38", icon: Calendar }
];

export const categories = [
  { id: 1, name: "Fiction", count: 8423 },
  { id: 2, name: "Non-fiction", count: 5672 },
  { id: 3, name: "Science", count: 3241 },
  { id: 4, name: "History", count: 2876 },
  { id: 5, name: "Biography", count: 2154 },
  { id: 6, name: "Children", count: 1897 },
  { id: 7, name: "Fantasy", count: 1432 },
  { id: 8, name: "Science Fiction", count: 1289 }
];

export const popularBooks = [
  { id: 1, title: "Atomic Habits", checkouts: 127 },
  { id: 2, title: "The Midnight Library", checkouts: 98 },
  { id: 3, title: "The Song of Achilles", checkouts: 87 },
  { id: 4, title: "Project Hail Mary", checkouts: 76 },
  { id: 5, title: "Klara and the Sun", checkouts: 65 }
];

export const members = [
  { id: 1, name: "John Smith", email: "john.smith@example.com", status: "Active", books: 2, joined: "Jan 15, 2023" },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", status: "Active", books: 3, joined: "Mar 22, 2023" },
  { id: 3, name: "Michael Brown", email: "mbrown@example.com", status: "Active", books: 1, joined: "Oct 5, 2023" },
  { id: 4, name: "Emma Wilson", email: "emma.w@example.com", status: "Active", books: 4, joined: "Feb 18, 2024" },
  { id: 5, name: "Lucas Martinez", email: "lucas.m@example.com", status: "Inactive", books: 0, joined: "May 30, 2023" },
  { id: 6, name: "Sophie Chen", email: "sophie.c@example.com", status: "Active", books: 2, joined: "Aug 12, 2023" }
];

export const loans = [
  { 
    id: 1, 
    bookTitle: "The Midnight Library", 
    memberName: "Emma Wilson", 
    checkoutDate: "April 10, 2025", 
    dueDate: "May 3, 2025",
    status: "On Time"
  },
  { 
    id: 2, 
    bookTitle: "Atomic Habits", 
    memberName: "John Smith", 
    checkoutDate: "April 3, 2025", 
    dueDate: "April 25, 2025",
    status: "On Time"
  },
  { 
    id: 3, 
    bookTitle: "The Invisible Life of Addie LaRue", 
    memberName: "Michael Brown", 
    checkoutDate: "April 8, 2025", 
    dueDate: "April 29, 2025",
    status: "On Time"
  },
  { 
    id: 4, 
    bookTitle: "The Song of Achilles", 
    memberName: "Sophie Chen", 
    checkoutDate: "April 12, 2025", 
    dueDate: "May 5, 2025",
    status: "On Time"
  },
  { 
    id: 5, 
    bookTitle: "Klara and the Sun", 
    memberName: "Sarah Johnson", 
    checkoutDate: "March 25, 2025", 
    dueDate: "April 15, 2025",
    status: "Overdue"
  }
];