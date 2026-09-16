import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChevronRight,
  ClipboardList,
  Clock,
  Sparkles,
  Video,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
} from "../Shared/ui";

const SCHEDULE = [
  { id: 1, subject: "Advanced Mathematics", teacher: "Dr. Johnson", room: "Hall 302", time: "10:00 AM", isLive: true },
  { id: 2, subject: "Physics Laboratory", teacher: "Dr. Maxwell", room: "Science Complex", time: "01:00 PM", isLive: false },
  { id: 3, subject: "English Literature", teacher: "Prof. Smith", room: "Room 118", time: "09:00 AM", day: "Tomorrow", isLive: false },
];

const DEADLINES = [
  { id: 1, title: "Calculus Problem Set #4", subject: "Mathematics", due: "Today, 11:59 PM", tone: "danger" },
  { id: 2, title: "Binary Trees Lab Exercise", subject: "Computer Science", due: "Tomorrow, 5:00 PM", tone: "warn" },
  { id: 3, title: "Optics Experiment Report", subject: "Physics", due: "Friday, 10:00 AM", tone: "neutral" },
];

// Simple CSS mini-chart for activity
const MiniChart = () => {
  const heights = [40, 70, 45, 90, 60, 30, 80];
  return (
    <div className="mt-4 flex h-10 items-end gap-1.5">
      {heights.map((h, i) => (
        <div key={i} className="w-1.5 rounded-t-full bg-brand-500/80 transition-all hover:bg-brand-600" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good day");
  const [studentName, setStudentName] = useState("Student");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) return;
    const raw = storedEmail.split("@")[0].replace(/[._-]/g, " ");
    const formatted = raw
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    setStudentName(formatted || "Student");
  }, []);

  return (
    <div className="space-y-7">
      {/* ── Custom Hero Banner ── */}
      <Card className="relative overflow-hidden p-8 sm:p-10">
        <div className="relative z-10 flex items-center justify-between">
          <div className="relative z-10 w-full max-w-2xl md:max-w-[55%]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/50 py-1 pl-1 pr-4 shadow-sm backdrop-blur-md">
              <span className="flex items-center gap-1.5 rounded-full bg-ink-900 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-white">
                <Sparkles size={12} className="text-brand-300" />
                STUDENT
              </span>
              <span className="text-[12px] font-semibold text-ink-600">
                <Sparkles size={12} className="mr-1 inline text-brand-500" />
                Virtual Classroom Portal
              </span>
            </div>
            
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl lg:text-5xl">
              {greeting},{" "}
              <span className="relative whitespace-nowrap text-brand-600">
                <span className="relative z-10 italic">{studentName}</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 0 100 15" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-lime" />
                  <path d="M0 18 Q 50 5 100 18" fill="none" stroke="currentColor" strokeWidth="3" className="text-brand-300" opacity="0.5" />
                </svg>
              </span>
            </h1>
            
            <p className="mt-6 text-[15px] font-medium leading-relaxed text-ink-500 sm:text-lg">
              Your live classes, coursework and submissions are ready for today. Here is everything that needs your attention.
            </p>
            
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="secondary" onClick={() => navigate("/ai")}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-600/15">
                  <Bot size={15} />
                </span>
                Ask AI assistant
              </Button>
              <Button icon={<ArrowRight size={16} />} onClick={() => navigate("/live-class")}>
                Join live classroom
              </Button>
            </div>
          </div>
          
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[50%] pointer-events-none rounded-r-3xl overflow-hidden">
            {/* The illustration with a seamless fade on the left */}
            <div className="absolute inset-0 z-0 [mask-image:linear-gradient(to_right,transparent,black_20%,black)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_20%,black)]">
               <img 
                 src="/dashboard-hero.jpg" 
                 alt="Student Dashboard Workspace" 
                 className="h-full w-full object-cover object-center mix-blend-multiply opacity-90 scale-110 translate-x-12" 
               />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Bento Grid Workspace ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        
        {/* Metric 1 */}
        <Card className="flex flex-col justify-between p-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <BookOpen size={22} />
          </div>
          <div className="mt-4">
            <dt className="text-[12px] font-bold uppercase tracking-widest text-ink-500">Enrolled Courses</dt>
            <dd className="mt-1 font-display text-3xl font-extrabold text-ink-900">5</dd>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="flex flex-col justify-between p-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <ClipboardList size={22} />
          </div>
          <div className="mt-4">
            <dt className="text-[12px] font-bold uppercase tracking-widest text-ink-500">Assignments Due</dt>
            <dd className="mt-1 font-display text-3xl font-extrabold text-ink-900">3</dd>
          </div>
        </Card>

        {/* Metric 3 (Spans 2 cols on wide screens) */}
        <Card className="flex flex-col justify-between p-6 hover:-translate-y-1 transition-transform duration-300 md:col-span-2 xl:col-span-2">
          <div className="flex items-start justify-between">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Clock size={22} />
            </div>
            <MiniChart />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <dt className="text-[12px] font-bold uppercase tracking-widest text-ink-500">Weekly Study Hours</dt>
              <dd className="mt-1 font-display text-3xl font-extrabold text-ink-900">18h 30m</dd>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <TrendingUpIcon /> +12%
            </span>
          </div>
        </Card>

        {/* Schedule (Spans 2 cols) */}
        <Card className="overflow-hidden md:col-span-2">
          <CardHeader
            title="Today's Schedule"
            description="Your upcoming classes and live sessions"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("/live-class")}>
                View all <ChevronRight size={14} />
              </Button>
            }
          />
          <ul className="divide-y divide-ink-900/[0.04]">
            {SCHEDULE.map((item) => (
              <li
                key={item.id}
                className={`grid grid-cols-[80px_1fr_auto] items-center gap-4 px-5 py-4 sm:px-6 transition-colors ${
                  item.isLive ? "bg-brand-50/40" : "hover:bg-white/60"
                }`}
              >
                <div>
                  <p className={`text-[13px] font-bold ${item.isLive ? "text-brand-700" : "text-ink-900"}`}>
                    {item.time}
                  </p>
                  {item.day && <p className="text-[11px] font-semibold text-ink-400 mt-0.5">{item.day}</p>}
                  {item.isLive && (
                    <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Live
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink-900">{item.subject}</p>
                  <p className="mt-0.5 truncate text-[12.5px] font-medium text-ink-500">
                    {item.teacher} · {item.room}
                  </p>
                </div>
                {item.isLive ? (
                  <Button variant="primary" size="sm" onClick={() => navigate("/live-class")}>
                    <Video size={14} className="mr-1.5" /> Join
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => navigate("/live-class")}>
                    View
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* Deadlines (Spans 2 cols) */}
        <Card className="flex flex-col overflow-hidden md:col-span-2">
          <CardHeader
            title="Pending Deadlines"
            description="Submissions due soon"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("/StudentDashboard/assignment")}>
                All assignments
              </Button>
            }
          />
          <ul className="flex-1 divide-y divide-ink-900/[0.04]">
            {DEADLINES.map((item) => (
              <li key={item.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/60 sm:px-6">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    item.tone === "danger"
                      ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                      : item.tone === "warn"
                        ? "bg-amber-500"
                        : "bg-ink-900/20"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink-900">{item.title}</p>
                  <p className="mt-0.5 truncate text-[12.5px] font-medium text-ink-500">{item.subject}</p>
                </div>
                <span className="shrink-0 text-right text-[12px] font-bold text-ink-600">{item.due}</span>
              </li>
            ))}
          </ul>
        </Card>
        
      </div>
    </div>
  );
};

// Small helper for the trending icon
const TrendingUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default Layout()(StudentDashboard);