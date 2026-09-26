import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Play, Star, ArrowRight, Radio, Sparkle, CheckCircle2 } from "lucide-react";
import Services from "../../constants/Services";
import VideoSection from "./components/VideoSection";
import DashboardSection from "./components/DashboardSection";
import CardUtils from "./utils/CardUtils";
import CardComponent from "./components/CardComponent.tsx";
import testimonials from "./utils/testimonial.ts";
import { TestimonialCard } from "./components/TestimonialCard";

import ServiceLayout from "../../layout/ServiceLayout";

const LOGOS = ["Harvard Prep", "SkillForge", "LearnLoop", "BrightClass", "EduNova", "StudySync"];

const HomePage = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 60 });
  }, []);
  const navigate = useNavigate();
  return (
    <div className="bg-paper text-ink-900 min-h-screen overflow-x-clip antialiased">
      {/* HERO */}
      <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-10 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-lime/30 blur-3xl animate-blob pointer-events-none" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div data-aos="fade-down" className="inline-flex items-center gap-2 rounded-full bg-white border border-ink-900/10 shadow-soft pl-1.5 pr-4 py-1.5 text-[13px] font-semibold text-ink-800">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 text-white px-2.5 py-1 text-[11px] font-bold tracking-wide">
              <Sparkles size={13} strokeWidth={2.5} /> NEW
            </span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-brand-600" /> Revolutionizing Digital Education</span>
          </div>
          <h1 data-aos="fade-up" className="font-display font-extrabold tracking-tight text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mt-6">
            Where learning
            <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="font-display italic font-bold text-brand-600">feels alive</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 20" fill="none" preserveAspectRatio="none">
                <path d="M5 14 Q 75 4 150 10 T 295 8" stroke="#D4F34E" strokeWidth="8" strokeLinecap="round" />
                <path d="M5 14 Q 75 4 150 10 T 295 8" stroke="#5B50E6" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed text-ink-500 text-balance">
            An AI-powered virtual classroom for live teaching, smart quizzes, attendance and analytics. Set up your college in minutes and teach from anywhere.
          </p>
          <div data-aos="fade-up" data-aos-delay="150" className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate("/signup")} className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 text-white pl-7 pr-2.5 py-2.5 text-[15px] font-bold shadow-pop hover:bg-brand-600 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
              Get Started free
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 group-hover:bg-white group-hover:text-ink-900 transition-colors"><ArrowRight size={18} /></span>
            </button>
            <a href="#video" className="inline-flex items-center gap-3 rounded-full bg-white border border-ink-900/10 shadow-soft pl-2 pr-7 py-2 text-[15px] font-bold hover:shadow-card hover:-translate-y-0.5 transition-all">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-600/15"><Play size={18} className="ml-0.5" fill="currentColor" /></span>
              Watch demo
              <span className="text-xs font-semibold text-ink-400">2:14</span>
            </a>
          </div>
          <div data-aos="fade-up" data-aos-delay="200" className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex -space-x-3">
              {["/images/avatar-1.jpg", "/images/avatar-2.jpg", "/images/avatar-3.jpg", "/images/avatar-4.jpg", "/images/avatar-5.jpg"].map((src) => (
                <img key={src} src={src} alt="learner" className="h-9 w-9 rounded-full ring-[2.5px] ring-paper object-cover bg-white" loading="lazy" />
              ))}
              <span className="h-9 px-2.5 rounded-full bg-ink-900 text-white text-[11px] font-bold grid place-items-center ring-[2.5px] ring-paper">12k+</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => (<Star key={i} size={15} className="fill-accent-amber text-accent-amber" />))}</span>
              <p className="text-[13px] font-semibold text-ink-600"><span className="text-ink-900 font-extrabold">4.9/5</span> from 12k+ happy learners</p>
            </div>
          </div>
          {/* HERO VISUAL */}
          <div data-aos="zoom-in" data-aos-delay="150" className="relative mt-14 max-w-5xl mx-auto">
            <div className="absolute -inset-6 bg-gradient-to-b from-brand-200/60 via-transparent to-transparent blur-2xl rounded-[3rem] pointer-events-none" />
            <div className="relative bg-white rounded-[2rem] border border-ink-900/10 shadow-card p-2.5 md:p-3 text-left">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 hidden md:block text-xs font-semibold text-ink-400 bg-paper border border-ink-900/10 rounded-full px-3 py-1">app.edumatrix.live/dashboard</span>
              </div>
              <img src="/images/dashboard.png" alt="Dashboard preview" className="w-full aspect-[16/10] sm:aspect-[16/8] rounded-[1.4rem] border border-ink-900/10 object-cover" />
              <div className="hidden lg:flex absolute -left-10 top-16 items-start gap-3 rounded-2xl bg-white/95 glass border border-ink-900/10 shadow-card p-4 w-60 animate-float text-left">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-500/15"><Radio size={19} /></span>
                <span>
                  <span className="flex items-center gap-1.5 text-[13px] font-extrabold">Live Class <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /></span>
                  <span className="block text-xs text-ink-500 font-medium mt-0.5">Physics 101 • 248 joined</span>
                  <span className="mt-2 block h-1.5 rounded-full bg-ink-900/10 overflow-hidden"><span className="block h-full w-[98%] rounded-full bg-accent-mint" /></span>
                  <span className="block mt-1 text-[11px] font-bold text-ink-600">Attendance 98%</span>
                </span>
              </div>
              <div className="hidden lg:block absolute -right-8 bottom-14 rounded-2xl bg-ink-900 text-white shadow-pop p-4 w-60 animate-float text-left" style={{ animationDelay: "1.2s" }}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-lime/15 text-accent-lime px-2.5 py-1 text-[11px] font-bold"><Sparkle size={12} /> AI QUIZ READY</span>
                <p className="mt-2 text-[13px] font-bold leading-snug">Generated 10 questions from Chapter 4</p>
                <div className="mt-3 flex gap-2">
                  <span className="flex-1 text-center rounded-lg bg-white text-ink-900 text-xs font-bold py-2">Preview</span>
                  <span className="flex-1 text-center rounded-lg bg-brand-500 text-white text-xs font-bold py-2">Assign</span>
                </div>
                <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-white/70"><CheckCircle2 size={12} className="text-accent-mint" /> Auto-graded + analytics</span>
              </div>
            </div>
          </div>
          {/* LOGO MARQUEE */}
          <div className="mt-12 pb-4">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-ink-400">TRUSTED BY MODERN CAMPUSES & TEAMS</p>
            <div className="relative mt-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max gap-3 animate-marquee">
                {LOGOS.concat(LOGOS).map((l, i) => (
                  <span key={i} className="rounded-full bg-white border border-ink-900/10 shadow-soft px-5 py-2.5 text-sm font-extrabold text-ink-600 whitespace-nowrap">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section id="features" className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <p data-aos="fade-up" className="inline-block rounded-full bg-brand-50 border border-brand-600/15 text-brand-700 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">WHY CHOOSE US</p>
            <h2 data-aos="fade-up" className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mt-4">Everything you need to <span className="italic text-brand-600">teach brilliantly</span></h2>
            <p data-aos="fade-up" className="mt-3 text-ink-500 leading-relaxed">Live classes, content, assessments and insights — stitched into one calm workspace.</p>
          </div>
          <div data-aos="fade-up" className="mt-10"><Services /></div>
        </div>
      </section>
      {/* EXPLORE */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto rounded-3xl sm:rounded-[2.5rem] bg-white border border-ink-900/10 shadow-card overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-5 sm:p-8 md:p-12">
              <p className="text-[11px] font-extrabold tracking-[0.16em] text-brand-600">EXPLORE OUR FEATURES</p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-3">Built for how college actually runs</h2>
              <p className="mt-3 text-ink-500 text-[15px] leading-relaxed">Record, go live, track progress and keep everyone in sync without juggling ten tools.</p>
              <div className="mt-7 flex flex-col gap-4">
                {CardUtils.map((props, index) => (
                  <CardComponent key={index} {...props} />
                ))}
              </div>
            </div>
            <div className="relative bg-cream p-5 sm:p-8 md:p-12 grid place-items-center overflow-hidden">
              <div className="absolute inset-0 dot-grid opacity-70" />
              <img src="/images/campus-students.jpg" alt="Students collaborating on campus" loading="lazy" className="relative rounded-[1.75rem] border border-ink-900/10 shadow-card object-cover h-64 sm:h-80 lg:h-[420px] w-full" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-10 rounded-xl sm:rounded-2xl glass border border-white/60 shadow-card p-3 sm:p-4 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-accent-lime font-display font-extrabold">A+</span>
                <span><span className="block text-sm font-extrabold">Average grade up 23%</span><span className="block text-xs text-ink-500 font-medium">after 8 weeks on EduMatrix</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* VIDEO */}
      <section id="video" className="px-4 sm:px-6 pb-12 sm:pb-20 scroll-mt-28">
        <div className="max-w-7xl mx-auto"><VideoSection /></div>
      </section>
      <DashboardSection />
      {/* TESTIMONIALS */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto text-center">
          <p data-aos="fade-up" className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">WALL OF LOVE</p>
          <h2 data-aos="fade-up" className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mt-4">What Our Users Say</h2>
          <p data-aos="fade-up" className="mt-3 text-ink-500">Loved by teachers, students and admins alike.</p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} quote={t.quote} author={t.author} role={t.role} avatarUrl={t.avatarUrl} />
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div data-aos="zoom-in" className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-white/85 backdrop-blur-xl border border-ink-900/10 p-6 sm:p-14 lg:p-16 text-center shadow-card">
          {/* Ambient Glows & Dot-Grid (Matches Header) */}
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

          <div className="relative z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-ink-900/10 shadow-soft pl-1.5 pr-4 py-1.5 text-[12px] font-semibold text-ink-800">
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 text-white px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
                <Sparkles size={12} strokeWidth={2.5} /> GET STARTED
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink-700">
                <Sparkles size={13} className="text-brand-600" /> Ready in under 2 minutes
              </span>
            </div>

            {/* Display Title */}
            <h2 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink-900 mt-6 text-balance">
              Start your classroom{" "}
              <span className="relative inline-block">
                <span className="font-display italic font-bold text-brand-600">today</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 150 20" fill="none" preserveAspectRatio="none">
                  <path d="M4 14 Q 40 4 75 10 T 146 8" stroke="#D4F34E" strokeWidth="7" strokeLinecap="round" />
                  <path d="M4 14 Q 40 4 75 10 T 146 8" stroke="#5B50E6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-ink-500 max-w-xl mx-auto leading-relaxed text-balance">
              Free for your first class. No credit card required. Invite teachers and students with one simple link.
            </p>

            {/* CTA Buttons (Matches Header) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 text-white pl-7 pr-2.5 py-2.5 text-[15px] font-bold shadow-pop hover:bg-brand-600 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5"
              >
                Create free classroom
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 group-hover:bg-white group-hover:text-ink-900 transition-colors">
                  <ArrowRight size={18} />
                </span>
              </button>
              <a
                href="#video"
                className="inline-flex items-center gap-3 rounded-full bg-white border border-ink-900/10 shadow-soft px-7 py-3 text-[15px] font-bold text-ink-800 hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                Talk to us
              </a>
            </div>

            {/* Feature Perks */}
            <div className="mt-10 pt-8 border-t border-ink-900/[0.06] flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-ink-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Free first class setup
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Instant shareable link
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceLayout()(HomePage);
