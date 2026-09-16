import { CheckCircle2, ArrowRight, TrendingUp, Users } from "lucide-react";

const features = [
  "Add teachers and students to your virtual college",
  "Upload assignments and auto-graded quizzes",
  "Manage timetable, announcements and reports",
  "Go live, track attendance and performance",
];

const DashboardSection = () => {
  return (
    <section className="px-6 pb-20">
      <div data-aos="fade-up" className="max-w-7xl mx-auto text-center">
        <p className="inline-block rounded-full bg-ink-900 text-white text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">ADMIN DASHBOARD</p>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mt-4 text-ink-900">Everything to run your college</h2>
        <p className="mt-3 text-ink-500 max-w-xl mx-auto">One calm command center for faculty, staff and leadership — from classes to results.</p>
        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-stretch text-left">
          <div className="relative">
            <img src="/images/live-teacher.jpg" alt="Teacher running a live class" loading="lazy" className="h-full min-h-[320px] w-full object-cover rounded-3xl border border-ink-900/10 shadow-card" />
            <div className="absolute left-5 bottom-5 right-5 sm:right-auto rounded-2xl bg-white/95 glass border border-ink-900/10 shadow-card p-4 flex items-center gap-4 animate-float">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-600/15"><Users size={22} /></span>
              <span><span className="block text-xs font-bold text-ink-500">Total Students</span><span className="block font-display text-2xl font-extrabold text-ink-900 leading-none mt-0.5">3,500</span></span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent-mint/15 text-emerald-700 text-xs font-extrabold px-2.5 py-1"><TrendingUp size={13} /> +12%</span>
            </div>
          </div>
          <div className="rounded-3xl bg-white border border-ink-900/10 shadow-card p-8 md:p-10">
            <h3 className="font-display text-xl md:text-2xl font-extrabold tracking-tight">Run the whole campus without chaos</h3>
            <ul className="mt-6 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] font-semibold text-ink-800">
                  <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-accent-mint" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 text-white text-sm font-bold pl-6 pr-2 py-2 hover:bg-brand-600 transition-colors">
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
