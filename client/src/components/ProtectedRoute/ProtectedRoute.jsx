
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return element;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-paper text-ink-900 antialiased">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 dot-grid opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/55 blur-3xl sm:h-[26rem] sm:w-[26rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-accent-lime/35 blur-3xl sm:h-96 sm:w-96"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5" aria-label="EduMatrix home">
          <img
            src="/logo/E.png"
            alt=""
            className="h-10 w-10 shrink-0 rounded-2xl bg-ink-900 object-contain shadow-soft transition-transform group-hover:scale-105"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-extrabold tracking-tight text-ink-900">
              EduMatrix
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400 min-[360px]:block">
              Virtual Classroom
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-4 py-2 text-xs font-semibold text-ink-700 shadow-soft transition-all hover:-translate-y-0.5 hover:border-ink-900/20 hover:shadow-card sm:text-sm"
        >
          <ArrowLeft size={15} />
          <span>Back to home</span>
        </Link>
      </header>

      <main
        id="main-content"
        className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12 pt-2 sm:px-6 sm:pb-16"
      >
        <div className="w-full max-w-lg">
          <div className="overflow-hidden rounded-[1.75rem] border border-ink-900/10 bg-white/95 shadow-card backdrop-blur-xl sm:rounded-[2.25rem]">
            {/* Branded header strip */}
            <div className="relative overflow-hidden border-b border-ink-900/[0.07] bg-gradient-to-br from-brand-50 via-white to-cream px-5 py-7 text-center sm:px-8 sm:py-9">
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-lime/30 blur-2xl" />
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-[1.35rem] bg-ink-900 text-white shadow-pop">
                <LockKeyhole size={27} />
                <span className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-full border-[3px] border-white bg-accent-lime text-ink-900">
                  <ShieldCheck size={13} strokeWidth={2.6} />
                </span>
              </span>
              <p className="relative mt-5 inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-500 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Secure area
              </p>
            </div>

            <div className="px-5 py-6 text-center sm:px-8 sm:py-8">
              <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900 text-balance sm:text-3xl">
                This classroom needs a <span className="italic text-brand-600">sign-in.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-500 sm:text-sm">
                You need a student account to open this page. Sign in with the credentials shared by
                your college administrator.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="group inline-flex min-h-[50px] w-full items-center justify-between rounded-full bg-ink-900 py-2 pl-6 pr-2.5 text-sm font-bold text-white shadow-pop transition-all hover:bg-brand-600 active:scale-[0.99]"
                >
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap size={17} /> Go to student login
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-colors group-hover:bg-white group-hover:text-ink-900">
                    <ArrowRight size={16} />
                  </span>
                </Link>
                <Link
                  to="/MainLogin"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-ink-900/15 bg-white px-5 text-sm font-bold text-ink-900 transition-colors hover:border-ink-900/30 hover:bg-ink-50 active:scale-[0.99]"
                >
                  Choose a different portal
                </Link>
              </div>

              <p className="mt-5 text-[11.5px] font-medium leading-relaxed text-ink-400">
                Session expired or not enrolled?{" "}
                <Link
                  to="/contact"
                  className="font-bold text-brand-700 underline decoration-brand-500/40 underline-offset-4 transition-colors hover:text-brand-600"
                >
                  Contact support
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] font-medium text-ink-400">
            Protected by EduMatrix secure access · 256-bit encryption
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute;
