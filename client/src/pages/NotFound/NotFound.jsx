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

import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  Home,
  Mail,
} from "lucide-react";

const quickLinks = [
  { to: "/", label: "Home", description: "Start from the beginning", icon: Home },
  { to: "/courses", label: "Courses", description: "Explore degree programs", icon: BookOpen },
  { to: "/notes", label: "Study notes", description: "Free revision material", icon: FileText },
  { to: "/contact", label: "Contact", description: "We will help you find it", icon: Mail },
];

const NotFound = () => {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-paper text-ink-900 antialiased">
      {/* Brand atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 dot-grid opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl sm:h-[26rem] sm:w-[26rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-accent-lime/30 blur-3xl sm:h-96 sm:w-96"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5" aria-label="EduMatrix home">
          <img
            src="/logo/E.png"
            alt=""
            className="h-10 w-10 shrink-0 rounded-2xl bg-ink-900 object-contain shadow-soft transition-transform group-hover:scale-105"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-extrabold tracking-tight text-ink-900">
              EduMatrix
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400 min-[360px]:block">
              Virtual Classroom
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-4 py-2 text-xs font-semibold text-ink-700 shadow-soft transition-all hover:-translate-y-0.5 hover:border-ink-900/20 hover:shadow-card sm:text-sm"
        >
          <ArrowLeft size={15} />
          <span>Back to home</span>
        </Link>
      </header>

      <main id="main-content" className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-ink-900/10 bg-white py-1.5 pl-1.5 pr-4 text-[12px] font-semibold text-ink-800 shadow-soft">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <Compass size={12} strokeWidth={2.5} /> Error 404
            </span>
            <span className="min-w-0">This classroom does not exist</span>
          </p>

          <p
            aria-hidden="true"
            className="relative mt-5 font-display text-[6.5rem] font-extrabold leading-[0.8] tracking-[-0.06em] text-ink-900 min-[420px]:text-[8rem] sm:mt-7 sm:text-[10.5rem]"
          >
            4<span className="italic text-brand-600">0</span>4
          </p>

          <h1 className="mt-8 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900 text-balance min-[420px]:text-3xl sm:mt-10 sm:text-4xl md:text-5xl">
            This page took a <span className="italic text-brand-600">wrong turn.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink-500 sm:mt-4 sm:text-base">
            The link may be outdated, mistyped, or the page has moved somewhere else. Let us get you
            back to the classroom.
          </p>

          <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
            <Link
              to="/"
              className="group inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-bold text-white shadow-pop transition-all hover:-translate-y-0.5 hover:bg-brand-600 active:scale-[0.99] sm:min-w-[190px]"
            >
              <Home size={16} />
              <span>Back to home</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-ink-900/15 bg-white px-6 text-sm font-bold text-ink-900 shadow-soft transition-all hover:-translate-y-0.5 hover:border-ink-900/30 hover:shadow-card active:scale-[0.99] sm:min-w-[170px]"
            >
              <Mail size={16} className="text-brand-600" />
              <span>Contact us</span>
            </Link>
          </div>
        </div>

        {/* Helpful shortcuts — turn a dead end into a next step */}
        <section aria-labelledby="quick-links" className="mx-auto mt-10 max-w-4xl sm:mt-14">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-ink-900/10" />
            <h2 id="quick-links" className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-400">
              Popular destinations
            </h2>
            <span aria-hidden="true" className="h-px w-8 bg-ink-900/10" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 lg:grid-cols-4">
            {quickLinks.map(({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex min-h-[104px] flex-col justify-between gap-3 rounded-2xl border border-ink-900/10 bg-white p-4 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:rounded-3xl sm:p-5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand-600/10 bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold leading-tight text-ink-900">{label}</span>
                  <span className="mt-0.5 block text-[11.5px] font-medium leading-snug text-ink-400">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ink-900/[0.08]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-400 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} EduMatrix Virtual Classroom</p>
          <p className="inline-flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-mint" />
            Where learning feels alive
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
