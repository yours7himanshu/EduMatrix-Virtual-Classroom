import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star, ArrowRight, Radio, CheckCircle2 } from "lucide-react";
import Services from "../../constants/Services";
import VideoSection from "./components/VideoSection";
import DashboardSection from "./components/DashboardSection";
import CardUtils from "./utils/CardUtils";
import CardComponent from "./components/CardComponent.tsx";
import testimonials from "./utils/testimonial.ts";
import { TestimonialCard } from "./components/TestimonialCard";

import ServiceLayout from "../../layout/ServiceLayout";

// Real product capabilities — not institution claims.
const CAPABILITIES = ["Live classes", "Smart quizzes", "Attendance", "Assignments", "Analytics", "Study notes"];

const HomePage = () => {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 40, disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }, []);
  const navigate = useNavigate();
  // Mobile testimonial dots carousel (desktop: 3-col grid).
  const trackRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || !track.children.length) return;
    const cardWidth = track.children[0].getBoundingClientRect().width + 12;
    setActiveSlide(Math.min(testimonials.length - 1, Math.max(0, Math.round(track.scrollLeft / cardWidth))));
  };
  const goToSlide = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(testimonials.length - 1, index));
    const card = track.children[clamped];
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft - 16, behavior: "smooth" });
  };
  return (
    <div className="bg-paper text-ink-900 min-h-screen overflow-x-clip antialiased">
      {/* HERO — mobile: left-aligned editorial. Desktop: centered. */}
      <section className="relative pt-[76px] sm:pt-28 pb-6 sm:pb-10 px-4 sm:px-6 overflow-hidden scroll-mt-20">
        {/* Decorative atmosphere: desktop only. Mobile stays flat for clarity + speed. */}
        <div aria-hidden="true" className="hidden sm:block absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div aria-hidden="true" className="hidden sm:block absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl animate-blob pointer-events-none" />
        <div aria-hidden="true" className="hidden sm:block absolute top-10 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-lime/30 blur-3xl animate-blob pointer-events-none" />
        <div className="relative max-w-7xl mx-auto text-left sm:text-center">
          {/* Announcement pill — roomy screens (original desktop element) */}
          <div data-aos="fade-down" className="hidden min-[480px]:inline-flex items-center gap-2 rounded-full bg-white border border-ink-900/10 shadow-soft pl-1.5 pr-4 py-1.5 text-[13px] font-semibold text-ink-800">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 text-white px-2.5 py-1 text-[11px] font-bold tracking-wide">
               NEW
            </span>
            <span className="inline-flex items-center gap-1.5"> Revolutionizing Digital Education</span>
          </div>
          {/* Compact eyebrow for phones */}
          <p data-aos="fade-down" className="inline-flex min-[480px]:hidden items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            EduMatrix · Virtual classroom
          </p>
          <h1 data-aos="fade-up" className="font-display font-extrabold tracking-tight text-balance text-[1.9rem] leading-[1.1] min-[375px]:text-[2.1rem] min-[420px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl sm:leading-[1.05] mt-3 sm:mt-6">
            Where learning
            <br className="hidden sm:block" />{" "}
            <span className="relative inline-block">
              <span className="font-display italic font-bold text-brand-600">feels alive</span>
              {/* Underline: subtle single stroke on phones, original dual stroke on desktop */}
              <svg className="sm:hidden absolute -bottom-1 left-0 w-full h-[8px]" viewBox="0 0 300 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M5 14 Q 75 4 150 10 T 295 8" stroke="#5B50E6" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
              </svg>
              <svg className="hidden sm:block absolute -bottom-2 left-0 w-full" viewBox="0 0 300 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M5 14 Q 75 4 150 10 T 295 8" stroke="#D4F34E" strokeWidth="8" strokeLinecap="round" />
                <path d="M5 14 Q 75 4 150 10 T 295 8" stroke="#5B50E6" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="100" className="mt-3 sm:mt-6 max-w-2xl sm:mx-auto text-[15px] md:text-lg leading-relaxed text-ink-600 text-balance">
            Live teaching, quizzes, attendance and analytics in one workspace. Set up your college in minutes.
          </p>
          <div data-aos="fade-up" data-aos-delay="150" className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-2.5 sm:gap-3 max-w-md sm:max-w-none sm:mx-auto w-full sm:w-auto">
            <button onClick={() => navigate("/MainLogin")} className="group inline-flex min-h-[50px] sm:min-h-[52px] w-full sm:w-auto sm:min-w-[220px] max-w-full overflow-hidden items-center justify-center gap-2 rounded-lg sm:rounded-full bg-ink-900 text-white px-6 sm:pl-7 sm:pr-2.5 py-3 sm:py-2.5 text-[15px] font-bold shadow-none sm:shadow-pop hover:bg-brand-600 hover:sm:shadow-card transition-all duration-300 motion-safe:hover:sm:-translate-y-0.5 active:scale-[0.99]">
              <span className="min-w-0 flex-1 sm:flex-none text-center leading-tight">Get started free</span>
              <ArrowRight size={17} className="sm:hidden shrink-0 transition-transform group-hover:translate-x-0.5" />
              <span className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 group-hover:bg-white group-hover:text-ink-900 transition-colors"><ArrowRight size={18} /></span>
            </button>
            <a href="#video" className="inline-flex min-h-[50px] sm:min-h-[52px] w-full sm:w-auto max-w-full overflow-hidden items-center justify-center gap-2 sm:gap-3 rounded-lg sm:rounded-full border border-ink-900/10 sm:border-ink-900/10 bg-transparent sm:bg-white shadow-none sm:shadow-soft px-5 sm:pl-2 sm:pr-7 py-3 sm:py-2 text-[14.5px] sm:text-[15px] font-bold hover:border-ink-900 transition-all motion-safe:hover:sm:shadow-card motion-safe:hover:sm:-translate-y-0.5 active:scale-[0.99]">
              <span className="sm:hidden inline-flex items-center gap-2"><Play size={15} className="shrink-0" fill="currentColor" /><span className="min-w-0 leading-tight">See live classes</span></span>
              <span className="hidden sm:inline-flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-600/15"><Play size={18} className="ml-0.5" fill="currentColor" /></span>
                Watch demo
                <span className="text-xs font-semibold text-ink-400">2:14</span>
              </span>
            </a>
          </div>
          {/* Proof: compact row on phones, original cluster on desktop */}
          <div data-aos="fade-up" data-aos-delay="200" className="sm:hidden mt-5 flex items-center gap-2.5">
            <div className="flex -space-x-2 shrink-0">
              {["/images/avatar-1.jpg", "/images/avatar-2.jpg", "/images/avatar-3.jpg"].map((src) => (
                <img key={src} src={src} alt="EduMatrix learner" className="h-7 w-7 rounded-full ring-2 ring-paper object-cover bg-white" loading="lazy" />
              ))}
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className="flex gap-0.5 shrink-0">{[0, 1, 2, 3, 4].map((i) => (<Star key={i} size={11} className="fill-accent-amber text-accent-amber" />))}</span>
              <p className="text-[11.5px] min-[375px]:text-[12px] font-semibold text-ink-600 leading-tight min-w-0"><span className="text-ink-900 font-extrabold">4.9/5</span> from 12k+ learners</p>
            </div>
          </div>
          <div data-aos="fade-up" data-aos-delay="200" className="hidden sm:flex mt-6 sm:mt-8 flex-col min-[480px]:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="flex -space-x-2.5 sm:-space-x-3">
              {["/images/avatar-1.jpg", "/images/avatar-2.jpg", "/images/avatar-3.jpg", "/images/avatar-4.jpg", "/images/avatar-5.jpg"].map((src) => (
                <img key={src} src={src} alt="learner" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-[2.5px] ring-paper object-cover bg-white" loading="lazy" />
              ))}
              <span className="h-8 sm:h-9 px-2.5 rounded-full bg-ink-900 text-white text-[11px] font-bold grid place-items-center ring-[2.5px] ring-paper">12k+</span>
            </div>
            <div className="flex items-center gap-2 text-left">
              <span className="hidden min-[420px]:flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => (<Star key={i} size={15} className="fill-accent-amber text-accent-amber" />))}</span>
              <p className="text-[12.5px] sm:text-[13px] font-semibold text-ink-600"><span className="text-ink-900 font-extrabold">4.9/5</span> from 12k+ happy learners</p>
            </div>
          </div>
          {/* HERO VISUAL — the product is the hero */}
          <div data-aos="fade-up" data-aos-delay="150" className="relative mt-6 sm:mt-14 max-w-5xl mx-auto sm:text-center">
            <div aria-hidden="true" className="hidden sm:block absolute -inset-6 bg-gradient-to-b from-brand-200/60 via-transparent to-transparent blur-2xl rounded-[3rem] pointer-events-none" />
            <div className="relative bg-white rounded-2xl sm:rounded-[2rem] border border-ink-900/10 shadow-card p-2.5 sm:p-3 lg:p-4 text-left">
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2 sm:ml-3 text-[11px] sm:text-xs font-semibold text-ink-400 sm:bg-paper sm:border sm:border-ink-900/10 rounded-full sm:px-3 py-0.5 sm:py-1 truncate">
                  app.edumatrix.live/dashboard
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl sm:rounded-[1.4rem] border border-ink-900/10 bg-slate-50">
                <img
                  src="/images/dashboard.png"
                  alt="EduMatrix admin dashboard with attendance and course stats"
                  loading="lazy"
                  className="w-full block object-cover object-top max-h-[300px] min-[480px]:max-h-[420px] sm:max-h-none h-auto"
                />
              </div>
              {/* Floating context badges: original desktop composition */}
              <div className="hidden lg:flex absolute -left-4 xl:-left-8 top-14 items-start gap-3 rounded-2xl bg-white/95 glass border border-ink-900/10 shadow-card p-3.5 sm:p-4 w-56 sm:w-60 motion-safe:animate-float text-left">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-500/15">
                  <Radio size={19} />
                </span>
                <span>
                  <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-ink-900">
                    Live Class <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </span>
                  <span className="block text-xs text-ink-500 font-medium mt-0.5">Physics 101 • 248 joined</span>
                  <span className="mt-2 block h-1.5 rounded-full bg-ink-900/10 overflow-hidden">
                    <span className="block h-full w-[98%] rounded-full bg-accent-mint" />
                  </span>
                  <span className="block mt-1 text-[11px] font-bold text-ink-600">Attendance 98%</span>
                </span>
              </div>
              <div
                className="hidden lg:block absolute opacity-85 -right-4 xl:-right-8 bottom-10 rounded-2xl bg-ink-900 text-white shadow-pop p-3.5 sm:p-4 w-56 sm:w-60 motion-safe:animate-float text-left"
                style={{ animationDelay: "1.2s" }}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-lime/15 text-accent-lime px-2.5 py-1 text-[11px] font-bold">
                  AI QUIZ READY
                </span>
                <p className="mt-2 text-[13px] font-bold leading-snug">Generated 10 questions from Chapter 4</p>
                <div className="mt-3 flex gap-2">
                  <span className="flex-1 text-center rounded-lg bg-white text-ink-900 text-xs font-bold py-2">Preview</span>
                  <span className="flex-1 text-center rounded-lg bg-brand-500 text-white text-xs font-bold py-2">Assign</span>
                </div>
                <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-white/70">
                  <CheckCircle2 size={12} className="text-accent-mint" /> Auto-graded + analytics
                </span>
              </div>
            </div>
            <p className="sm:hidden mt-2 text-[12px] font-medium text-ink-400 text-left">Your college workspace — classes, attendance and results in one view.</p>
          </div>
          {/* Capability strip — real product scope, no institution claims */}
          <div className="mt-6 sm:mt-12 pb-2 sm:pb-4 border-t border-ink-900/10 pt-4 sm:border-t-0 sm:pt-0">
            <p className="text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.18em] text-ink-400 text-left sm:text-center">EVERYTHING IN ONE WORKSPACE</p>
            <div className="relative mt-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max gap-5 sm:gap-3 animate-marquee motion-reduce:animate-none">
                {CAPABILITIES.concat(CAPABILITIES).map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-5 text-[13px] sm:text-sm font-bold text-ink-600 whitespace-nowrap">
                    {l}<span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand-600/50" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — editorial index on mobile, cards on desktop */}
      <section id="features" className="px-4 sm:px-6 py-8 sm:py-20 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-left sm:text-center max-w-2xl sm:mx-auto">
            <p data-aos="fade-up" className="sm:hidden text-[11px] font-extrabold tracking-[0.16em] text-brand-700">WHY EDUMATRIX</p>
            <p data-aos="fade-up" className="hidden sm:inline-block rounded-full bg-brand-50 border border-brand-600/15 text-brand-700 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">WHY CHOOSE US</p>
            <h2 data-aos="fade-up" className="font-display text-[1.5rem] leading-[1.15] min-[420px]:text-[1.65rem] md:text-5xl font-extrabold tracking-tight mt-2 text-balance">Everything you need to teach</h2>
            <p data-aos="fade-up" className="mt-2 text-[14px] sm:text-base text-ink-500 leading-relaxed">Live classes, assignments and insights — one calm workspace.</p>
          </div>
          <div data-aos="fade-up" className="mt-6 sm:mt-10"><Services /></div>
        </div>
      </section>

      {/* WORKFLOW — flat timeline on mobile, original split card on desktop */}
      <section className="px-4 sm:px-6 pb-8 sm:pb-20">
        <div className="max-w-7xl mx-auto sm:rounded-[2.5rem] sm:bg-white sm:border sm:border-ink-900/10 sm:shadow-card overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-0">
            <div className="sm:p-8 md:p-12">
              <p className="text-[11px] font-extrabold tracking-[0.16em] text-brand-600">EXPLORE OUR FEATURES</p>
              <h2 className="font-display text-[1.5rem] leading-[1.15] min-[420px]:text-[1.65rem] md:text-4xl font-extrabold tracking-tight mt-2 text-balance">Built for how college actually runs</h2>
              <p className="mt-2 text-ink-500 text-[14px] sm:text-[15px] leading-relaxed">Record, go live and track progress without juggling ten tools.</p>
              <div className="mt-4 sm:mt-7 flex flex-col border-t border-ink-900/10 sm:border-t-0">
                {CardUtils.map((props, index) => (
                  <CardComponent key={index} {...props} />
                ))}
              </div>
            </div>
            <div className="relative sm:bg-cream sm:p-8 md:p-12 sm:grid sm:place-items-center overflow-hidden">
              <div aria-hidden="true" className="hidden sm:block absolute inset-0 dot-grid opacity-70" />
              <img src="/images/campus-students.jpg" alt="Students in a classroom" loading="lazy" className="relative rounded-xl sm:rounded-[1.75rem] border border-ink-900/10 sm:shadow-card object-cover h-44 min-[375px]:h-52 min-[480px]:h-64 sm:h-80 lg:h-[420px] w-full" />
              {/* Original desktop overlay badge (desktop only) */}
              <div className="hidden sm:flex absolute sm:bottom-10 sm:left-10 sm:right-10 rounded-2xl glass border border-white/60 shadow-card p-4 items-center gap-3 max-w-full overflow-hidden">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-accent-lime font-display font-extrabold">A+</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold leading-tight">Average grade up 23%</span><span className="block text-xs text-ink-500 font-medium leading-tight">after 8 weeks on EduMatrix</span></span>
              </div>
              <p className="sm:hidden mt-2 text-[12px] font-medium text-ink-400">Recorded sessions, live classes and progress — together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section id="video" className="px-4 sm:px-6 pb-8 sm:pb-20 scroll-mt-20 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto"><VideoSection /></div>
      </section>
      <DashboardSection />

      {/* TESTIMONIALS — dots carousel on mobile, grid on desktop */}
      <section className="py-8 sm:py-20 border-t border-ink-900/10 sm:border-t-0">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 text-left sm:text-center max-w-2xl sm:mx-auto">
            <p data-aos="fade-up" className="sm:hidden text-[11px] font-extrabold tracking-[0.16em] text-ink-500">CLASSROOM STORIES</p>
            <p data-aos="fade-up" className="hidden sm:inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">WALL OF LOVE</p>
            <h2 data-aos="fade-up" className="font-display text-[1.5rem] leading-[1.15] min-[420px]:text-[1.65rem] md:text-5xl font-extrabold tracking-tight mt-2 sm:mt-4 text-balance">What our users say</h2>
            <p data-aos="fade-up" className="hidden sm:block mt-3 text-ink-500">Loved by teachers, students and admins alike.</p>
          </div>
          <div className="mt-5 sm:mt-10 lg:hidden">
            <div
              ref={trackRef}
              onScroll={handleTrackScroll}
              className="no-scrollbar -mx-0 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-[84%] max-w-[330px] min-[480px]:w-[64%] shrink-0 snap-center text-left">
                  <TestimonialCard quote={t.quote} author={t.author} role={t.role} avatarUrl={t.avatarUrl} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-start px-4 gap-1.5" role="tablist" aria-label="Testimonials">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activeSlide}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => goToSlide(i)}
                  className={`h-1.5 rounded-full transition-all min-h-0 min-w-0 ${i === activeSlide ? "w-6 bg-ink-900" : "w-1.5 bg-ink-900/20 hover:bg-ink-900/40"}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-10 hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left lg:grid px-4 sm:px-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} quote={t.quote} author={t.author} role={t.role} avatarUrl={t.avatarUrl} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — dark conclusion panel */}
      <section className="px-4 sm:px-6 pb-10 sm:pb-24">
        <div data-aos="fade-up" className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink-900 text-white p-5 min-[375px]:p-6 sm:p-14 lg:p-16 text-left sm:text-center">
          <div className="relative z-10">
            <p className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60">
              Ready in 2 minutes
            </p>
            <h2 className="font-display font-extrabold tracking-tight text-[1.4rem] leading-[1.12] min-[375px]:text-[1.5rem] min-[420px]:text-3xl sm:text-4xl md:text-5xl mt-2 sm:mt-3 text-balance">
              Start your classroom{" "}
              <span className="italic text-accent-lime">today</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-[13.5px] sm:text-lg text-white/70 max-w-xl sm:mx-auto leading-relaxed text-balance">
              Free for your first class. No credit card required.
            </p>
            {/* Mobile: one compact primary + quiet text link */}
            <div className="sm:hidden mt-4">
              <button
                onClick={() => navigate("/signup")}
                className="group inline-flex min-h-[50px] w-full max-w-full items-center justify-center gap-2 rounded-lg bg-white text-ink-900 px-5 text-[14.5px] font-bold hover:bg-accent-lime transition-colors active:scale-[0.99]"
              >
                <span className="whitespace-nowrap leading-none">Create free classroom</span>
                <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#video"
                className="inline-flex min-h-[44px] items-center gap-1 text-[13.5px] font-bold text-white/80 hover:text-white active:scale-[0.99] transition-colors"
              >
                Talk to us <ArrowRight size={14} className="shrink-0" />
              </a>
              <p className="mt-3 text-[12px] font-medium leading-relaxed text-white/55">
                Free first class<span aria-hidden="true" className="mx-1.5 text-white/30">·</span>No credit card<span aria-hidden="true" className="mx-1.5 text-white/30">·</span>One shareable link
              </p>
            </div>
            {/* Desktop: original paired pills + checklist */}
            <div className="hidden sm:flex mt-6 flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-2.5 max-w-md sm:max-w-none sm:mx-auto">
              <button
                onClick={() => navigate("/signup")}
                className="group inline-flex min-h-[50px] w-full sm:w-auto max-w-full overflow-hidden items-center justify-center gap-2 rounded-lg sm:rounded-full bg-white text-ink-900 px-6 py-3 text-[15px] font-bold hover:bg-accent-lime hover:text-ink-900 transition-colors active:scale-[0.99]"
              >
                <span className="min-w-0 flex-1 sm:flex-none text-center leading-tight">Create free classroom</span>
                <ArrowRight size={17} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#video"
                className="inline-flex min-h-[50px] w-full sm:w-auto max-w-full items-center justify-center rounded-lg sm:rounded-full border border-white/20 px-6 py-3 text-[14.5px] font-bold text-white hover:border-white/50 transition-colors active:scale-[0.99]"
              >
                Talk to us
              </a>
            </div>
            <ul className="hidden sm:grid mt-6 pt-5 border-t border-white/10 grid-cols-1 min-[480px]:grid-cols-3 gap-2 text-[12.5px] sm:text-sm font-semibold text-white/75 max-w-2xl sm:mx-auto">
              {["Free first class setup", "No credit card required", "Instant shareable link"].map((perk) => (
                <li key={perk} className="flex items-center gap-2 min-[480px]:justify-center">
                  <CheckCircle2 size={15} className="shrink-0 text-accent-mint" />
                  <span className="min-w-0 leading-tight">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceLayout()(HomePage);
