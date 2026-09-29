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

import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Bot,
  ChevronDown,
  CreditCard,
  FileText,
  Library,
  LogOut,
  Menu,
  Video,
  X,
} from "lucide-react";
import { IconButton, PageBackdrop } from "../Shared/ui";

const NAV_LINKS = [
  { to: "/StudentDashboard/dashboard", label: "Dashboard" },
  { to: "/StudentDashboard/announcement", label: "Announcements" },
  { to: "/StudentDashboard/assignment", label: "Assignments" },
  { to: "/StudentDashboard/quiz", label: "Quizzes" },
];

const MORE_LINKS = [
  { to: "/StudentDashboard/teachersNotes", label: "Teachers' Notes", icon: FileText },
  { to: "/StudentDashboard/library", label: "Library", icon: Library },
  { to: "/ai", label: "AI Assistant", icon: Bot },
  { to: "/StudentDashboard/notes", label: "PDF Summarizer", icon: FileText },
  { to: "/StudentDashboard/payfees", label: "Pay Fees", icon: CreditCard },
  { to: "/live-class", label: "Live Classroom", icon: Video },
];

/* Landing Navbar styling, reused verbatim so both headers read as one product. */
const pillClass = (active) =>
  `rounded-full px-5 py-2 text-sm transition-colors ${
    active
      ? "bg-ink-100 font-semibold text-ink-900 shadow-sm"
      : "font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
  }`;

const Layout = () => (WrapLayoutComponent) => {
  return function DashboardLayoutWrapper(props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [studentName, setStudentName] = useState("Student");
    const [studentEmail, setStudentEmail] = useState("student@edumatrix.edu");
    const [studentInitial, setStudentInitial] = useState("S");

    const moreRef = useRef(null);
    const profileRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      const storedEmail = localStorage.getItem("email");
      if (!storedEmail) return;
      setStudentEmail(storedEmail);
      const raw = storedEmail.split("@")[0].replace(/[._-]/g, " ");
      const formatted = raw
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setStudentName(formatted || "Student");
      setStudentInitial((formatted && formatted.charAt(0).toUpperCase()) || "S");
    }, []);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (moreRef.current && !moreRef.current.contains(event.target)) {
          setMoreOpen(false);
        }
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setProfileOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      setMoreOpen(false);
      setMobileOpen(false);
      setProfileOpen(false);
    }, [location.pathname]);

    // Lock body scroll while the mobile drawer is open; close on Escape.
    useEffect(() => {
      if (!mobileOpen) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e) => {
        if (e.key === "Escape") setMobileOpen(false);
      };
      document.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener("keydown", onKey);
      };
    }, [mobileOpen]);

    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/MainLogin");
    };

    const isMoreActive = MORE_LINKS.some((link) => location.pathname === link.to);

return (
      <div className="relative min-h-screen overflow-x-clip bg-paper text-ink-900 antialiased selection:bg-brand-100 selection:text-brand-700">
        {/* Brand ambience — identical to the marketing site hero */}
        <PageBackdrop />

        <header className="sticky top-0 inset-x-0 z-50">
          <div className="border-b border-ink-900/10 bg-white/80 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
              {/* Brand lockup (identical to landing Navbar) */}
              <Link to="/StudentDashboard/dashboard" className="group flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-soft transition-transform group-hover:scale-105 overflow-hidden">
                  <img
                    src="/E.png"
                    alt="EduMatrix Logo"
                    className="h-full w-full object-cover rounded-2xl select-none"
                  />
                </span>
                <span className="leading-tight">
                  <span className="block text-base font-bold text-ink-900 font-display">EduMatrix</span>
                  <span className="block text-xs font-medium text-ink-500">
                    Virtual Classroom
                  </span>
                </span>
              </Link>

              {/* Floating pill nav (identical to landing Navbar) */}
              <div className="hidden items-center gap-1 rounded-full border border-ink-900/10 bg-white p-1 shadow-sm lg:flex">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={pillClass(location.pathname === link.to)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => setMoreOpen((open) => !open)}
                    aria-expanded={moreOpen}
                    className={`${pillClass(isMoreActive || moreOpen)} inline-flex items-center gap-1`}
                  >
                    More
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {moreOpen ? (
                    <div className="absolute right-0 top-[calc(100%+12px)] max-h-[calc(100dvh-6rem)] w-[min(14rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-3xl border border-ink-900/10 bg-white p-1.5 shadow-card">
                      {MORE_LINKS.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.to;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] transition-colors ${
                              active
                                ? "bg-ink-100 font-semibold text-ink-900"
                                : "font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                            }`}
                          >
                            <Icon size={15} className={active ? "" : "text-ink-400"} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
{/* Account actions (mirrors landing "Sign in / Get started") */}
              <div className="hidden items-center gap-3 lg:flex">
                <div className="relative">
                  <IconButton
                    label="Announcements"
                    onClick={() => navigate("/StudentDashboard/announcement")}
                  >
                    <Bell size={16} />
                  </IconButton>
                  <span className="pointer-events-none absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 ring-2 ring-white" />
                </div>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((open) => !open)}
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 font-display text-[13px] font-bold text-white transition-transform hover:scale-105"
                  >
                    {studentInitial}
                  </button>

                  {profileOpen ? (
                    <div role="menu" className="absolute right-0 top-[calc(100%+12px)] max-h-[calc(100dvh-5rem)] w-[min(16rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-3xl border border-ink-900/10 bg-white p-1.5 shadow-card">
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-ink-900 font-display text-[12px] font-bold text-white">
                          {studentInitial}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-ink-900">
                            {studentName}
                          </p>
                          <p className="truncate text-[11.5px] font-medium text-ink-500">
                            {studentEmail}
                          </p>
                        </div>
                      </div>
                      <div className="my-1 h-px bg-ink-900/[0.06]" />
                      {MORE_LINKS.slice(0, 3).map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                          >
                            <Icon size={15} className="text-ink-400" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <div className="my-1 h-px bg-ink-900/[0.06]" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => navigate("/live-class")}
                  className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-ink-800"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live class
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-900/10 bg-white transition-transform active:scale-95 lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="student-mobile-nav"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </nav>
{/* Mobile drawer — same pattern as the landing Navbar */}
            {mobileOpen ? (
              <div id="student-mobile-nav" className="border-t border-ink-900/10 bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-xl lg:hidden">
                <nav aria-label="Student" className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain pb-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={location.pathname === link.to ? "page" : undefined}
                    className={`mt-1.5 block min-h-[44px] rounded-2xl px-4 py-3 text-[15px] first:mt-0 ${
                      location.pathname === link.to
                        ? "bg-ink-100 font-semibold text-ink-900"
                        : "font-medium text-ink-700 hover:bg-ink-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <p className="mb-1 mt-4 px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                  More
                </p>
                {MORE_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={`mt-1.5 flex min-h-[44px] items-center gap-2.5 rounded-2xl px-4 py-3 text-[15px] ${
                        active
                          ? "bg-ink-100 font-semibold text-ink-900"
                          : "font-medium text-ink-700 hover:bg-ink-50"
                      }`}
                    >
                      <Icon size={17} className={active ? "" : "text-ink-400"} />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="mt-4 flex flex-col gap-2.5 min-[380px]:flex-row min-[380px]:gap-3">
                  <button
                    onClick={handleLogout}
                    className="min-h-[44px] flex-1 rounded-full border border-ink-900/15 px-4 py-2.5 text-sm font-semibold text-ink-700"
                  >
                    Sign out
                  </button>
                  <button
                    onClick={() => navigate("/live-class")}
                    className="min-h-[44px] flex-1 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Live class
                  </button>
                </div>
                </nav>
              </div>
            ) : null}
          </div>
        </header>

        {/* Workspace */}
        <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <WrapLayoutComponent {...props} />
        </main>

        <footer className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 pt-2 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 border-t border-ink-900/10 pt-6 text-[11.5px] font-semibold text-ink-400 sm:flex-row">
            <span>EduMatrix Virtual Classroom · Student workspace</span>
            <span>Need a hand? Ask the AI Assistant.</span>
          </div>
        </footer>
      </div>
    );
  };
};

export default Layout;