import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/aboutUs", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile sheet whenever a new page is opened.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Lock background scroll and support Escape while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-ink-900/10 bg-white/90 backdrop-blur-xl">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6"
        >
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="EduMatrix home">
            <img
              src="/logo/E.png"
              alt=""
              className="h-8 w-8 shrink-0 rounded-xl bg-ink-900 object-contain sm:h-10 sm:w-10 sm:rounded-2xl"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-bold text-ink-900 sm:text-base">
                EduMatrix
              </span>
              <span className="hidden text-[10px] font-semibold tracking-[0.14em] text-ink-500 min-[360px]:block">
                CLASSROOM
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-ink-900/10 bg-white p-1 shadow-sm lg:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white shadow"
                    : "rounded-full px-5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/MainLogin"
              className="inline-flex min-h-[44px] items-center px-1 text-sm font-semibold text-ink-700 transition-colors hover:text-ink-900"
            >
              Sign in
            </Link>
            <Link
              to="/MainLogin"
              className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-600"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink-900/10 bg-white transition-transform active:scale-95 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open ? (
          <div
            id="mobile-navigation"
            className="border-t border-ink-900/10 bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "mt-1.5 block min-h-[48px] rounded-2xl bg-ink-900 px-4 py-3 text-[15px] font-semibold text-white first:mt-0"
                      : "mt-1.5 block min-h-[48px] rounded-2xl px-4 py-3 text-[15px] font-medium text-ink-700 transition-colors hover:bg-ink-50 first:mt-0"
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-4 flex flex-col gap-2.5 min-[380px]:flex-row min-[380px]:gap-3">
                <Link
                  to="/MainLogin"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-ink-900/15 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-ink-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/MainLogin"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Get started
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
