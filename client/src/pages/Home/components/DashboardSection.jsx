import { CheckCircle2, ArrowRight, TrendingUp, Users } from "lucide-react";

const features = [
  "Add teachers and students to your virtual college",
  "Upload assignments and auto-graded quizzes",
  "Manage timetable, announcements and reports",
  "Go live, track attendance and performance",
];

// Compact mobile labels for the same four workflows (no icons on phones).
const workflowGrid = [
  { title: "People", text: "Teachers & students in one directory" },
  { title: "Assessment", text: "Assignments & auto-graded quizzes" },
  { title: "Planning", text: "Timetable, announcements & reports" },
  { title: "Teaching", text: "Live classes, attendance & results" },
];

// Desktop composition = original (centered pill header, photo + floating glass
// stat card, white checklist card with green checks). Mobile is product-led:
// preview photo first, then a compact 2×2 workflow grid and a single compact CTA.
const DashboardSection = () => {
  return (
    <section className="px-4 sm:px-6 pb-10 sm:pb-20 scroll-mt-20 sm:scroll-mt-24">
      <div data-aos="fade-up" className="max-w-7xl mx-auto text-left sm:text-center">
        {/* Section header: desktop only on phones (the panel heading below carries mobile) */}
        <div className="hidden sm:block">
          <p className="inline-block rounded-full bg-ink-900 text-white text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">ADMIN DASHBOARD</p>
          <h2 className="font-display text-[1.65rem] leading-[1.1] min-[420px]:text-3xl md:text-5xl font-extrabold tracking-tight mt-3 sm:mt-4 text-ink-900 text-balance">Everything to run your college</h2>
          <p className="mt-2.5 sm:mt-3 text-ink-500 text-[13.5px] sm:text-base max-w-xl mx-auto leading-relaxed">One calm command center for faculty, staff and leadership — from classes to results.</p>
        </div>
        <div className="mt-0 sm:mt-10 grid lg:grid-cols-2 gap-5 sm:gap-8 items-stretch sm:text-left">
          <div className="relative min-w-0">
            <img src="/images/graduation.jpg" alt="Teacher running a live class" loading="lazy" className="h-52 min-[375px]:h-60 min-[480px]:h-72 sm:h-full sm:min-h-[320px] w-full object-cover rounded-[1.25rem] sm:rounded-3xl border border-ink-900/10 shadow-card" />
            {/* Stat mirrors the dashboard KPI demo data; kept as product context */}
            <div className="absolute left-2.5 bottom-2.5 right-2.5 min-[375px]:left-3 min-[375px]:bottom-3 min-[375px]:right-3 sm:left-5 sm:bottom-5 sm:right-auto rounded-2xl bg-white/95 glass border border-ink-900/10 shadow-card p-2.5 min-[375px]:p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 motion-safe:animate-float motion-reduce:animate-none max-w-[calc(100%-1.25rem)] overflow-hidden">
              <span className="grid h-9 w-9 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-600/15"><Users size={19} /></span>
              <span className="min-w-0 flex-1"><span className="block text-[10.5px] sm:text-xs font-bold text-ink-500 leading-tight truncate">Total Students</span><span className="block font-display text-lg sm:text-2xl font-extrabold text-ink-900 leading-none mt-0.5">3,500</span></span>
              <span className="ml-auto sm:ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-mint/15 text-emerald-700 text-[11px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-1"><TrendingUp size={12} /> +12%</span>
            </div>
          </div>
          <div className="sm:rounded-3xl sm:bg-white sm:border sm:border-ink-900/10 sm:shadow-card sm:p-8 md:p-10">
            <p className="sm:hidden text-[11px] font-extrabold tracking-[0.16em] text-ink-500">ADMIN DASHBOARD</p>
            <h3 className="font-display text-[1.35rem] min-[420px]:text-[1.5rem] sm:text-xl md:text-2xl font-extrabold tracking-tight leading-[1.15] mt-1.5 sm:mt-0">Run the whole campus without chaos</h3>
            {/* Mobile: compact 2×2 workflow grid, no checkmark icons */}
            <div className="sm:hidden mt-4 grid grid-cols-2 gap-2">
              {workflowGrid.map((w) => (
                <div key={w.title} className="rounded-lg border border-ink-900/10 bg-white px-3 py-2.5 min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-700">{w.title}</p>
                  <p className="mt-1 text-[12.5px] font-semibold leading-snug text-ink-800">{w.text}</p>
                </div>
              ))}
            </div>
            {/* Desktop: original green-check checklist */}
            <ul className="hidden sm:block mt-4 sm:mt-6 space-y-2.5 sm:space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 sm:gap-3 text-[13.5px] sm:text-[15px] font-semibold text-ink-800 leading-snug">
                  <CheckCircle2 size={19} className="mt-0 shrink-0 text-accent-mint" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="group mt-4 sm:mt-8 inline-flex min-h-[44px] sm:min-h-[48px] w-auto max-w-full items-center gap-2 rounded-lg sm:rounded-full bg-ink-900 text-white text-[13.5px] sm:text-sm font-bold px-5 sm:pl-6 sm:pr-2 sm:py-2 hover:bg-brand-600 active:scale-[0.99] transition-all">
              <span className="min-w-0 leading-tight">Explore dashboard</span>
              <ArrowRight size={15} className="sm:hidden shrink-0" />
              <span className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 group-hover:bg-white group-hover:text-ink-900 transition-colors"><ArrowRight size={17} /></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
