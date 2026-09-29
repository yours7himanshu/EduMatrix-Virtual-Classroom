import { CheckCircle2, ArrowRight, TrendingUp, Users } from "lucide-react";

const features = [
  "Add teachers and students to your virtual college",
  "Upload assignments and auto-graded quizzes",
  "Manage timetable, announcements and reports",
  "Go live, track attendance and performance",
];

const DashboardSection = () => {
  return (
    <section className="px-4 sm:px-6 pb-12 sm:pb-20">
      <div data-aos="fade-up" className="max-w-7xl mx-auto text-center">
        <p className="inline-block rounded-full bg-ink-900 text-white text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">ADMIN DASHBOARD</p>
        <h2 className="font-display text-[1.65rem] leading-[1.1] min-[420px]:text-3xl md:text-5xl font-extrabold tracking-tight mt-3 sm:mt-4 text-ink-900 text-balance">Everything to run your college</h2>
        <p className="mt-2.5 sm:mt-3 text-ink-500 text-[13.5px] sm:text-base max-w-xl mx-auto leading-relaxed">One calm command center for faculty, staff and leadership — from classes to results.</p>
        <div className="mt-7 sm:mt-10 grid lg:grid-cols-2 gap-4 sm:gap-8 items-stretch text-left">
          <div className="relative">
            <img src="/images/live-teacher.jpg" alt="Teacher running a live class" loading="lazy" className="h-60 min-[480px]:h-72 sm:h-full sm:min-h-[320px] w-full object-cover rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-card" />
            <div className="absolute left-3 bottom-3 right-3 sm:left-5 sm:bottom-5 sm:right-auto rounded-2xl bg-white/95 glass border border-ink-900/10 shadow-card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 motion-safe:animate-float motion-reduce:animate-none">
              <span className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-600/15"><Users size={20} /></span>
              <span><span className="block text-[11px] sm:text-xs font-bold text-ink-500">Total Students</span><span className="block font-display text-xl sm:text-2xl font-extrabold text-ink-900 leading-none mt-0.5">3,500</span></span>
              <span className="ml-1 sm:ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-mint/15 text-emerald-700 text-[11px] sm:text-xs font-extrabold px-2.5 py-1"><TrendingUp size={12} /> +12%</span>
            </div>
          </div>
          <div className="rounded-[1.5rem] sm:rounded-3xl bg-white border border-ink-900/10 shadow-card p-5 sm:p-8 md:p-10">
            <h3 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight leading-snug">Run the whole campus without chaos</h3>
            <ul className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 sm:gap-3 text-[13.5px] sm:text-[15px] font-semibold text-ink-800 leading-snug">
                  <CheckCircle2 size={19} className="mt-0 shrink-0 text-accent-mint" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="group mt-6 sm:mt-8 inline-flex min-h-[48px] w-full min-[420px]:w-auto items-center justify-center gap-2 rounded-full bg-ink-900 text-white text-sm font-bold pl-6 pr-2 py-2 hover:bg-brand-600 active:scale-[0.99] transition-all">
              Explore dashboard
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 group-hover:bg-white group-hover:text-ink-900 transition-colors"><ArrowRight size={17} /></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
