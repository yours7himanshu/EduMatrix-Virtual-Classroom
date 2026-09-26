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
import { 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Sparkles,
  ArrowLeft,
  Video,
  Bot,
  FileText,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const MainLoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper text-ink-900 relative overflow-hidden flex flex-col justify-between antialiased selection:bg-brand-100 selection:text-brand-700">
      {/* ─── Ambient Glow Blobs & Dot-Grid (Matches Website Header Color Combo) ─── */}
      <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
      <div className="absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full bg-brand-200/55 blur-3xl pointer-events-none" />
      <div className="absolute top-10 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-lime/35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-[24rem] w-[38rem] rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />

      {/* ─── Top Navigation Bar ─── */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-soft transition-transform group-hover:scale-105">
            <span className="text-xl font-bold font-display">E</span>
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-ink-900 font-display">
              EduMatrix
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Virtual Classroom
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white border border-ink-900/10 shadow-soft px-4 py-2 text-xs sm:text-sm font-semibold text-ink-700 hover:bg-ink-50 hover:shadow-card hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* ─── Center Portal Section ─── */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 flex-1 flex flex-col items-center justify-center text-center">
        {/* Floating Pill Badge (Matches Header Style) */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white border border-ink-900/10 shadow-soft pl-1.5 pr-4 py-1.5 text-[12px] font-semibold text-ink-800">
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 text-white px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
            <Sparkles size={12} strokeWidth={2.5} /> SECURE GATEWAY
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-700">
            <Sparkles size={13} className="text-brand-600" /> Choose Your Portal
          </span>
        </div>

        {/* Title with Hand-Drawn Doodle Underline */}
        <h1 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl text-ink-900 mt-6 text-balance">
          Sign in to your{" "}
          <span className="relative inline-block">
            <span className="font-display italic font-bold text-brand-600">workspace</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 16" fill="none" preserveAspectRatio="none">
              <path d="M4 11 Q 50 3 100 8 T 196 6" stroke="#D4F34E" strokeWidth="6" strokeLinecap="round" />
              <path d="M4 11 Q 50 3 100 8 T 196 6" stroke="#5B50E6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-ink-500 max-w-xl mx-auto leading-relaxed text-balance">
          Select your dedicated account type to access classroom collaboration, learning resources, or institute management.
        </p>

        {/* ─── Role Selection Cards Grid ─── */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 w-full max-w-3xl text-left">
          {/* Student Card */}
          <div
            onClick={() => navigate('/login')}
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] border border-ink-900/10 p-5 sm:p-8 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer ring-1 ring-transparent hover:ring-brand-500/30 overflow-hidden"
          >
            {/* Subtle lavender ambient corner glow inside card */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-100/60 blur-2xl group-hover:bg-brand-200/80 transition-all pointer-events-none" />

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/70 text-brand-600 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-[11px] font-bold px-3 py-1 uppercase tracking-wider">
                  Student
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="mt-6 font-display text-2xl font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                Student Portal
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Join live interactive classes, submit assignments, take quizzes, and study with your personalized AI assistant.
              </p>

              {/* Feature Chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper border border-ink-900/[0.08] px-2.5 py-1 text-xs font-semibold text-ink-700">
                  <Video size={13} className="text-brand-600" /> Live Classes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper border border-ink-900/[0.08] px-2.5 py-1 text-xs font-semibold text-ink-700">
                  <Bot size={13} className="text-brand-600" /> AI Assistant
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper border border-ink-900/[0.08] px-2.5 py-1 text-xs font-semibold text-ink-700">
                  <FileText size={13} className="text-brand-600" /> Notes & Tests
                </span>
              </div>
            </div>

            {/* Action Button (Matches Website Header Style) */}
            <div className="mt-8 relative z-10">
              <button
                type="button"
                className="w-full inline-flex items-center justify-between rounded-full bg-ink-900 text-white pl-6 pr-2.5 py-2.5 text-sm font-bold shadow-soft group-hover:bg-brand-600 group-hover:shadow-card transition-all duration-300"
              >
                <span>Continue as Student</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 group-hover:bg-white group-hover:text-ink-900 transition-colors">
                  <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>

          {/* Faculty & Administrator Card */}
          <div
            onClick={() => {
              const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';
              window.location.href = adminUrl;
            }}
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] border border-ink-900/10 p-5 sm:p-8 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer ring-1 ring-transparent hover:ring-accent-lime overflow-hidden"
          >
            {/* Subtle lime ambient corner glow inside card */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent-lime/25 blur-2xl group-hover:bg-accent-lime/45 transition-all pointer-events-none" />

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-lime/20 border border-accent-lime/40 text-ink-900 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  <ShieldCheck className="h-7 w-7 text-ink-900" />
                </div>
                <span className="rounded-full bg-accent-lime/30 border border-accent-lime/50 text-ink-900 text-[11px] font-bold px-3 py-1 uppercase tracking-wider">
                  Faculty & Admin
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="mt-6 font-display text-2xl font-bold text-ink-900 group-hover:text-ink-900 transition-colors">
                Faculty & Admin
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Manage courses, schedule lectures, broadcast campus announcements, and supervise student records.
              </p>

              {/* Feature Chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper border border-ink-900/[0.08] px-2.5 py-1 text-xs font-semibold text-ink-700">
                  <BarChart3 size={13} className="text-ink-800" /> Analytics
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper border border-ink-900/[0.08] px-2.5 py-1 text-xs font-semibold text-ink-700">
                  <Users size={13} className="text-ink-800" /> Faculty Suite
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper border border-ink-900/[0.08] px-2.5 py-1 text-xs font-semibold text-ink-700">
                  <Calendar size={13} className="text-ink-800" /> Schedules
                </span>
              </div>
            </div>

            {/* Action Button (Matches Website Header Style) */}
            <div className="mt-8 relative z-10">
              <button
                type="button"
                className="w-full inline-flex items-center justify-between rounded-full bg-white border border-ink-900/15 text-ink-900 pl-6 pr-2.5 py-2.5 text-sm font-bold shadow-soft hover:bg-ink-50 hover:border-ink-900/30 transition-all duration-300"
              >
                <span>Open Admin Console</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-white transition-colors">
                  <ExternalLink size={15} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Bottom Navigation Prompt ─── */}
        <p className="mt-8 sm:mt-10 text-sm text-ink-500">
          Need a new classroom account?{' '}
          <Link
            to="/signup"
            className="font-bold text-ink-900 underline underline-offset-4 decoration-brand-500 hover:text-brand-600 transition-colors"
          >
            Create free classroom
          </Link>
        </p>
      </main>

      {/* ─── Minimal Bottom Copyright ─── */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 border-t border-ink-900/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-400">
        <p>© {new Date().getFullYear()} EduMatrix Virtual Classroom. All rights reserved.</p>
        <div className="flex items-center gap-4 text-ink-500">
          <Link to="/aboutUs" className="hover:text-ink-900 transition-colors">About</Link>
          <span>•</span>
          <Link to="/contact" className="hover:text-ink-900 transition-colors">Help & Support</Link>
          <span>•</span>
          <span>SSL 256-bit Secure</span>
        </div>
      </footer>
    </div>
  );
};

export default MainLoginPage;