import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/aboutUs", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/contact", label: "Contact" },
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="border-b border-ink-900/10 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-xl font-bold text-white">E</span>
            <span className="leading-tight">
              <span className="block text-base font-bold text-ink-900">EduMatrix</span>
              <span className="block text-xs font-medium text-ink-500">Virtual Classroom</span>
            </span>
          </Link>
          <div className="hidden items-center gap-1 rounded-full border border-ink-900/10 bg-white p-1 shadow-sm md:flex">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/"}
                className={({ isActive }) => (isActive ? "rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white shadow" : "rounded-full px-5 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900")}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => navigate("/MainLogin")} className="text-sm font-semibold text-ink-700 hover:text-ink-900">Sign in</button>
            <button onClick={() => navigate("/signup")} className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-ink-800">Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></button>
          </div>
          <button onClick={() => setOpen(!open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/10 bg-white md:hidden" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
        {open && (
          <div className="border-t border-ink-900/10 bg-white px-4 pb-6 pt-3 shadow-xl md:hidden">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? "block rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white" : "block rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50")}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-4 flex gap-3">
              <button onClick={() => navigate("/MainLogin")} className="flex-1 rounded-full border border-ink-900/15 px-4 py-2.5 text-sm font-semibold">Sign in</button>
              <button onClick={() => navigate("/signup")} className="flex-1 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white">Get started</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

