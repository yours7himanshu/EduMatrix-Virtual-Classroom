import React from "react";

/**
 * EduMatrix — Light Premium Shared UI
 * Light-first primitives: white surfaces, soft borders, ink text, brand accents.
 */

export function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Pill({ children, className = "", dot = true, dotClassName = "bg-brand-500" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-white border border-ink-900/10 shadow-soft px-4 py-1.5 text-xs font-semibold tracking-wide text-ink-700 ${className}`}
    >
      {dot && (
        <span className={`relative flex h-2 w-2 shrink-0`}>
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-30 ${dotClassName}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClassName}`} />
        </span>
      )}
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
  subClassName = "",
}) {
  const isCenter = align === "center";
  return (
    <div className={`${isCenter ? "mx-auto text-center items-center" : "text-left items-start"} flex max-w-3xl flex-col ${className}`}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 ${eyebrowClassName}`}
        >
          <span className="hidden h-px w-6 bg-brand-600/40 sm:inline-block" />
          {eyebrow}
          <span className={`h-px w-6 bg-brand-600/40 ${isCenter ? "sm:inline-block" : "hidden"}`} />
        </span>
      )}
      {title && (
        <h2
          className={`mt-3 font-display text-3xl font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-4xl lg:text-[2.75rem] ${titleClassName}`}
        >
          {title}
        </h2>
      )}
      {sub && (
        <p
          className={`mt-4 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg ${isCenter ? "mx-auto" : ""} ${subClassName}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function PrimaryBtn({
  children,
  href,
  to,
  onClick,
  type = "button",
  className = "",
  withArrow = false,
  ...rest
}) {
  const link = href || to;
  const classes = `group inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:bg-brand-600 hover:shadow-card hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0 ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {withArrow && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
  if (link) {
    return (
      <a href={link} onClick={onClick} className={classes} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {inner}
    </button>
  );
}

export function GhostBtn({
  children,
  href,
  to,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
  const link = href || to;
  const classes = `inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 border border-ink-900/15 shadow-soft transition-all duration-300 hover:border-ink-900/25 hover:shadow-card hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0 ${className}`;
  if (link) {
    return (
      <a href={link} onClick={onClick} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}

export const LOGOS = [
  { name: "Google Classroom", short: "Google", initial: "G" },
  { name: "Zoom", short: "Zoom", initial: "Z" },
  { name: "Microsoft Teams", short: "Teams", initial: "T" },
  { name: "Coursera", short: "Coursera", initial: "C" },
  { name: "Udemy", short: "Udemy", initial: "U" },
  { name: "Khan Academy", short: "Khan", initial: "K" },
];

export default Container;
