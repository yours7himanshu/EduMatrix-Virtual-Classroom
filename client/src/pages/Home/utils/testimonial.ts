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

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Live classes feel truly interactive \u2014 instant doubt resolution and the whiteboard make concepts stick. My students participate far more than before.",
    author: "Priya Sharma",
    role: "Teacher",
    avatarUrl: "/images/avatar-1.jpg",
  },
  {
    quote: "The AI assistant explains answers step by step at 2am before exams. Recorded sessions plus auto-graded assignments keep my preparation on track.",
    author: "Aarav Patel",
    role: "Student",
    avatarUrl: "/images/avatar-2.jpg",
  },
  {
    quote: "The admin dashboard is intuitive \u2014 attendance, schedules and performance in one place. We run the whole institute without spreadsheets now.",
    author: "Rahul Verma",
    role: "Admin",
    avatarUrl: "/images/avatar-3.jpg",
  },
  {
    quote: "As a parent I can finally see progress, upcoming tests and teacher feedback in one dashboard. It keeps our whole family organised.",
    author: "Meera Iyer",
    role: "Parent",
    avatarUrl: "/images/avatar-4.jpg",
  },
  {
    quote: "Assignments with detailed solutions and regular feedback transformed my Revision routine. The analytics show exactly where I need to improve.",
    author: "Sofia Fernandes",
    role: "Student",
    avatarUrl: "/images/avatar-5.jpg",
  },
  {
    quote: "Breakout rooms, polls and live Q&A make online teaching joyful. Doubt sessions that used to take days now resolve within minutes.",
    author: "David Chen",
    role: "Teacher",
    avatarUrl: "/images/avatar-6.jpg",
  },
];

export default testimonials;