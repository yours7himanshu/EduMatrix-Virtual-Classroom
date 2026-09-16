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
import { useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Library,
  LogOut,
  Megaphone,
  Video,
  X,
} from "lucide-react";
import Logo from "./Logo";
import "./Sidebar.css";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { path: "/StudentDashboard/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/StudentDashboard/announcement", label: "Announcements", icon: Megaphone },
    ],
  },
  {
    label: "Academics",
    items: [
      { path: "/StudentDashboard/assignment", label: "Assignments", icon: ClipboardList },
      { path: "/StudentDashboard/quiz", label: "Quizzes", icon: HelpCircle },
      { path: "/StudentDashboard/teachersNotes", label: "Teachers' notes", icon: FileText },
      { path: "/StudentDashboard/library", label: "Library", icon: Library },
    ],
  },
  {
    label: "Services & tools",
    items: [
      { path: "/StudentDashboard/notes", label: "PDF summarizer", icon: FileText },
      { path: "/ai", label: "AI Assistant", icon: HelpCircle },
      { path: "/live-class", label: "Live classroom", icon: Video },
      { path: "/StudentDashboard/payfees", label: "Pay fees", icon: CreditCard },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (location.pathname !== path) navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/MainLogin");
  };

  const sidebarBody = (
    <aside className="flex h-full w-64 select-none flex-col border-r border-ink-900/[0.08] bg-white lg:w-72">
      <div className="flex items-center justify-between border-b border-ink-900/[0.08] px-5 py-4">
        <Logo />
        {onClose ? (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900 lg:hidden"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <nav className="hide-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex}>
            <p className="px-3 pb-2 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors ${
                      active
                        ? "bg-ink-900 font-semibold text-white"
                        : "font-medium text-ink-600 hover:bg-paper hover:text-ink-900"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={active ? "text-white" : "text-ink-400 group-hover:text-ink-900"}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-900/[0.08] p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-ink-900/[0.08] bg-paper px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-900 font-display text-[11px] font-bold text-white">
              S
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12.5px] font-bold text-ink-900">
                Student account
              </p>
              <p className="truncate text-[11px] font-medium text-ink-500">
                Virtual classroom
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-full p-1.5 text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">{sidebarBody}</div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-10 h-full shadow-2xl">{sidebarBody}</div>
        </div>
      ) : null}
    </>
  );
};

export default Sidebar;