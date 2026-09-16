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

import React, { useState } from 'react';
import { FileText, Download, Sparkles, Search, BookOpen, Clock } from 'lucide-react';
import ServiceLayout from '../../layout/ServiceLayout.jsx';

const notesData = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    code: "CS-201",
    description: "Learn fundamental sorting algorithms, computational complexity, recursion, and dynamic programming with step-by-step illustrations.",
    pages: "48 pages",
    updated: "Semester 3",
    downloadLink: "/notes/algorithms.pdf",
  },
  {
    id: 2,
    title: "Database Management Systems",
    code: "CS-302",
    description: "Comprehensive study notes on relational algebra, SQL optimization, B+ trees, normalization (1NF-BCNF), and ACID transactions.",
    pages: "62 pages",
    updated: "Semester 4",
    downloadLink: "/notes/dbms.pdf",
  },
  {
    id: 3,
    title: "Operating Systems Principles",
    code: "CS-304",
    description: "In-depth reference covering process scheduling, memory virtualization, thread synchronization, deadlocks, and Unix file systems.",
    pages: "55 pages",
    updated: "Semester 4",
    downloadLink: "/notes/os.pdf",
  },
  {
    id: 4,
    title: "Computer Networks & Protocols",
    code: "CS-401",
    description: "Detailed architecture of OSI model, TCP/IP stack, socket programming, routing protocols, and modern network security fundamentals.",
    pages: "70 pages",
    updated: "Semester 5",
    downloadLink: "/notes/networks.pdf",
  },
  {
    id: 5,
    title: "Machine Learning Foundations",
    code: "AI-405",
    description: "Mathematical foundations of regression, gradient descent, SVMs, neural architectures, loss functions, and scikit-learn implementations.",
    pages: "84 pages",
    updated: "Semester 6",
    downloadLink: "/notes/ml.pdf",
  },
  {
    id: 6,
    title: "Software Engineering & Agile",
    code: "SE-305",
    description: "Best practices for system design, design patterns, microservices architecture, CI/CD deployment pipelines, and sprint management.",
    pages: "42 pages",
    updated: "Semester 5",
    downloadLink: "/notes/se.pdf",
  },
];

const NotesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notesData.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Sparkles size={12} strokeWidth={2.5} /> STUDY MATERIALS
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-700">
              <BookOpen size={13} className="text-brand-600" /> Curated Lecture Notes
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-6 text-balance">
            Course Study{" "}
            <span className="relative inline-block">
              <span className="font-display italic font-bold text-brand-600">Notes</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 150 20" fill="none" preserveAspectRatio="none">
                <path d="M4 14 Q 40 4 75 10 T 146 8" stroke="#D4F34E" strokeWidth="7" strokeLinecap="round" />
                <path d="M4 14 Q 40 4 75 10 T 146 8" stroke="#5B50E6" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed text-balance">
            High-quality revision material, lecture slides, and references verified by faculty for your semester exams.
          </p>

          {/* Search Pill Input */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, course code, or subject..."
              className="w-full pl-12 pr-5 py-3.5 bg-white border border-ink-900/10 rounded-full shadow-soft text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>
      </section>

      {/* ─── Notes Cards Grid ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="group bg-white rounded-3xl border border-ink-900/10 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center ring-1 ring-brand-600/15 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                      <FileText size={22} />
                    </div>
                    <span className="rounded-full bg-paper border border-ink-900/[0.08] text-ink-700 text-xs font-bold px-3 py-1">
                      {note.code}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-5 font-display text-xl font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                    {note.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                    {note.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="mt-4 flex items-center gap-3 text-xs font-medium text-ink-400">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen size={13} className="text-brand-600" />
                      {note.pages}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-brand-600" />
                      {note.updated}
                    </span>
                  </div>
                </div>

                {/* Download Pill Button */}
                <div className="mt-7 pt-5 border-t border-ink-900/[0.06]">
                  <a
                    href={note.downloadLink}
                    download
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 text-white py-3 px-5 text-sm font-bold shadow-soft hover:bg-brand-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Download PDF Notes</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-ink-900/10 shadow-soft max-w-md mx-auto">
            <FileText size={36} className="text-ink-300 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-ink-900">No notes found</h3>
            <p className="text-sm text-ink-500 mt-1">Try adjusting your search query.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ServiceLayout()(NotesPage);
