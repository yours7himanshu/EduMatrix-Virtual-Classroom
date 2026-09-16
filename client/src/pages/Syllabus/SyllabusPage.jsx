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

import React from 'react';
import { Calendar, Download, Sparkles, CheckCircle2, BookOpen, Clock } from 'lucide-react';
import ServiceLayout from '../../layout/ServiceLayout.jsx';

const syllabusData = [
  {
    id: 1,
    course: "Computer Science 101",
    code: "CS-101",
    description: "Foundational programming concepts, data structures, algorithm efficiency, and object-oriented paradigms designed for modern software development.",
    schedule: "Mon, Wed, Fri • 9:00 AM - 11:00 AM",
    topics: [
      "Introduction to Computing & Memory Model",
      "Modular Programming & Recursion",
      "Abstract Data Types & Linked Structures",
      "Algorithmic Complexity (Big O Notation)",
      "Object-Oriented Design & Inheritance",
      "File I/O & Exception Handling",
    ],
    syllabusLink: "/syllabus/cs101.pdf",
  },
  {
    id: 2,
    course: "Discrete Mathematics & Linear Algebra",
    code: "MATH-201",
    description: "Mathematical reasoning, graph theory, combinatorics, matrix transformations, and statistical probability essential for algorithmic problem-solving.",
    schedule: "Tue, Thu • 10:00 AM - 12:00 PM",
    topics: [
      "Set Theory & Predicate Logic",
      "Proof Techniques & Mathematical Induction",
      "Matrices, Eigenvalues & Transformations",
      "Graph Theory & Tree Traversal",
      "Combinatorics & Discrete Probability",
      "Number Theory & Cryptographic Basics",
    ],
    syllabusLink: "/syllabus/maths101.pdf",
  },
  {
    id: 3,
    course: "Relational Database Systems",
    code: "DB-301",
    description: "Modern database management architecture, SQL querying, schema normalization, transaction isolation levels, indexing, and NoSQL alternatives.",
    schedule: "Mon, Wed • 2:00 PM - 4:00 PM",
    topics: [
      "Relational Model & Relational Algebra",
      "Complex SQL Queries & Joins",
      "Functional Dependencies & Normalization",
      "ACID Properties & Concurrency Control",
      "B-Tree Indexing & Query Plans",
      "Introduction to Distributed Datastores",
    ],
    syllabusLink: "/syllabus/dbms.pdf",
  },
  {
    id: 4,
    course: "Operating Systems & Virtualization",
    code: "OS-302",
    description: "Core principles of modern operating systems, CPU scheduling, virtual memory paging, process concurrency, deadlocks, and containerization.",
    schedule: "Tue, Thu • 2:00 PM - 4:00 PM",
    topics: [
      "Kernel Architecture & System Calls",
      "Process Scheduling & Multi-threading",
      "Synchronization Primitives & Mutexes",
      "Virtual Memory & Paging Algorithms",
      "File System Structures & Storage",
      "Containerization & Isolation Concepts",
    ],
    syllabusLink: "/syllabus/os.pdf",
  },
  {
    id: 5,
    course: "Software Engineering & Architecture",
    code: "SE-401",
    description: "Software development lifecycle, system architecture design, microservices, unit testing, agile sprint management, and cloud deployment pipelines.",
    schedule: "Mon, Wed, Fri • 3:00 PM - 5:00 PM",
    topics: [
      "Agile & Scrum Development Methodologies",
      "System Architecture & Microservices Patterns",
      "Design Patterns (GoF) & Clean Code",
      "Automated Testing (Unit, Integration, E2E)",
      "CI/CD Pipelines & DevOps Fundamentals",
      "Security Audits & Production Deployment",
    ],
    syllabusLink: "/syllabus/se.pdf",
  },
];

const SyllabusPage = () => {
  return (
    <div className="min-h-screen bg-paper text-ink-900 antialiased selection:bg-brand-100 selection:text-brand-700">
      {/* ─── Hero Header Section ─── */}
      <section className="relative pt-32 pb-10 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
        <div className="absolute top-10 -right-24 h-96 w-96 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-ink-900/10 shadow-soft pl-1.5 pr-4 py-1.5 text-[12px] font-semibold text-ink-800">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 text-white px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
              <Sparkles size={12} strokeWidth={2.5} /> CURRICULUM
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-700">
              <BookOpen size={13} className="text-brand-600" /> Academic Roadmaps & Schedules
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-6 text-balance">
            Course{" "}
            <span className="relative inline-block">
              <span className="font-display italic font-bold text-brand-600">Syllabus</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 150 20" fill="none" preserveAspectRatio="none">
                <path d="M4 14 Q 40 4 75 10 T 146 8" stroke="#D4F34E" strokeWidth="7" strokeLinecap="round" />
                <path d="M4 14 Q 40 4 75 10 T 146 8" stroke="#5B50E6" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed text-balance">
            Detailed curriculum guides, semester timelines, and weekly topic breakdowns for every enrolled academic subject.
          </p>
        </div>
      </section>

      {/* ─── Syllabus Cards List ─── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="space-y-8">
          {syllabusData.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-ink-900/10 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 p-7 sm:p-9"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-bold px-3 py-1 uppercase tracking-wider inline-block">
                    {course.code}
                  </span>
                  <h2 className="mt-2.5 font-display text-2xl font-bold text-ink-900">
                    {course.course}
                  </h2>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-paper border border-ink-900/[0.08] px-4 py-2 text-xs font-semibold text-ink-700 shrink-0">
                  <Clock size={14} className="text-brand-600" />
                  <span>{course.schedule}</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-ink-500 leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Topics Grid */}
              <div className="mt-6 pt-6 border-t border-ink-900/[0.06]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-4">
                  Core Topics Covered
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {course.topics.map((topic, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-ink-700">
                      <CheckCircle2 size={16} className="text-brand-600 shrink-0 mt-0.5" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="mt-8 pt-6 border-t border-ink-900/[0.06] flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs text-ink-400 font-medium">
                  Official syllabus document • Updated for current academic year
                </span>
                <a
                  href={course.syllabusLink}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-ink-900 text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-soft hover:bg-brand-600 transition-colors"
                >
                  <Download size={15} />
                  <span>Download Full Syllabus</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServiceLayout()(SyllabusPage);
