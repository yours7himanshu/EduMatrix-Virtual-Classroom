import { Link } from 'react-router-dom';
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Heart
} from 'lucide-react';

const learningLinks = [
  { label: 'All Courses', to: '/courses' },
  { label: 'Live Classes', to: '/live-class' },
  { label: 'AI Assistant', to: '/ai' },
  { label: 'Study Notes', to: '/notes' },
  { label: 'Syllabus Guide', to: '/syllabus' },
];

const portalLinks = [
  { label: 'Student Dashboard', to: '/StudentDashboard/dashboard' },
  { label: 'Student Login', to: '/login' },
  { label: 'Admin Console', to: '/MainLogin' },
  { label: 'Assignments', to: '/StudentDashboard/assignment' },
  { label: 'Digital Library', to: '/StudentDashboard/library' },
];

const companyLinks = [
  { label: 'About Us', to: '/aboutUs' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Join as Teacher', to: '/contact' },
  { label: 'Privacy Policy', to: '/contact' },
  { label: 'Terms of Service', to: '/contact' },
];

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/yours7himanshu/EduMatrix-Virtual-Classroom' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative bg-paper text-ink-900 border-t border-ink-900/[0.08] antialiased">
      {/* Subtle Dot-Grid Background & Ambient Lighting */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-brand-100/35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-accent-lime/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 pt-10 sm:pt-16 pb-10 sm:pb-12">
        {/* ─── Main Footer Columns ─── */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-5 lg:gap-12">
          {/* Brand & Mission Column (Span 2) */}
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-soft transition-transform group-hover:scale-105">
                <span className="text-lg font-bold font-display">E</span>
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

            <p className="mt-4 text-sm leading-relaxed text-ink-500 max-w-sm">
              An AI-powered virtual classroom for live teaching, smart quizzes, automated attendance, and interactive study. Set up your college in minutes and teach from anywhere.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-900/10 bg-white text-ink-500 shadow-soft transition-all hover:border-ink-900/30 hover:bg-ink-900 hover:text-white hover:shadow-card active:scale-95 sm:h-9 sm:w-9"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups: 2-col on phones so the footer reads as one block */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 min-[480px]:grid-cols-3 sm:gap-8 lg:col-span-3">
          {/* Learning Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Learning
            </h4>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {learningLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-500 font-medium transition-colors hover:text-ink-900 hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Portals
            </h4>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {portalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-500 font-medium transition-colors hover:text-ink-900 hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-2 min-[480px]:col-span-1">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Company
            </h4>
            <ul className="mt-4 sm:mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 min-[480px]:flex min-[480px]:flex-col min-[480px]:gap-2.5 sm:gap-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-500 font-medium transition-colors hover:text-ink-900 hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>

        {/* ─── Bottom Copyright Bar ─── */}
        <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-ink-900/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-ink-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} EduMatrix Virtual Classroom. All rights reserved.
          </p>

          <p className="inline-flex items-center gap-1.5 font-medium text-ink-400">
            Where learning feels alive
            <Heart size={13} className="fill-brand-500 text-brand-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
