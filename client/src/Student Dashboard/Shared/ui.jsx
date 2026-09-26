/*
Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Shared design kit for every screen in the Student Dashboard.
 *
 * Design rules encoded here (mirrors the marketing site so the product feels
 * like one brand — same paper canvas, aurora glows, pill nav, dark pill CTAs):
 *  - Surfaces  : white cards, radius 24px, hairline ink border, soft layered shadow.
 *  - Ambience  : dot grid + brand/lime glow blobs behind the workspace (PageBackdrop).
 *  - Type      : Sora for headings/numbers with italic brand accents, Jakarta for UI.
 *  - Accent    : ink-900 drives actions, brand-600 marks state, lime only as a highlight.
 */
import React from "react";
import { Search, Sparkles } from "lucide-react";

export const SURFACE =
  "rounded-2xl sm:rounded-3xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-card";

export const INTERACTIVE =
  "transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-900/20 hover:shadow-card";

/* ─────────────────────────── brand backdrop ─────────────────────────── */

export const PageBackdrop = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 dot-grid opacity-60" />
    <div className="absolute -top-24 -left-24 h-[36rem] w-[36rem] rounded-full bg-brand-200/50 blur-[100px] animate-blob" />
    <div className="absolute top-10 -right-24 h-[32rem] w-[32rem] rounded-full bg-accent-lime/30 blur-[100px] animate-blob" style={{ animationDelay: "1s" }} />
    <div className="absolute top-[40%] -left-32 h-[36rem] w-[36rem] rounded-full bg-brand-200/40 blur-[100px] animate-blob" style={{ animationDelay: "2s" }} />
    <div className="absolute bottom-[-10%] -right-24 h-[32rem] w-[32rem] rounded-full bg-accent-lime/25 blur-[100px] animate-blob" style={{ animationDelay: "4s" }} />
  </div>
);

/* Italic brand accent with the landing's double-stroke underline. */
export const AccentWord = ({ children }) => (
  <span className="relative inline-block">
    <span className="font-display italic font-bold text-brand-600">{children}</span>
    <svg
      className="absolute -bottom-2 left-0 w-full"
      viewBox="0 0 300 20"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M5 14 Q 75 4 150 10 T 295 8" stroke="#D4F34E" strokeWidth="8" strokeLinecap="round" />
      <path d="M5 14 Q 75 4 150 10 T 295 8" stroke="#5B50E6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </span>
);

/* ─────────────────────────────── layout blocks ─────────────────────────────── */

export const Card = ({ className = "", as: Tag = "section", children, ...rest }) => (
  <Tag className={`${SURFACE} ${className}`} {...rest}>
    {children}
  </Tag>
);

export const CardHeader = ({ title, description, action, className = "" }) => (
  <header
    className={`flex items-start justify-between gap-4 border-b border-ink-900/[0.08] px-5 py-4 sm:px-6 ${className}`}
  >
    <div className="min-w-0">
      <h2 className="font-display text-[15px] font-bold leading-tight text-ink-900">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{description}</p>
      ) : null}
    </div>
    {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
  </header>
);

export const Eyebrow = ({ children, className = "" }) => (
  <p
    className={`text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-400 ${className}`}
  >
    {children}
  </p>
);

/* Badge pill exactly like the landing hero: dark chip inside a white pill. */
export const HeroBadge = ({ chip, label }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white py-1.5 pl-1.5 pr-4 shadow-soft">
    <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
      <Sparkles size={12} strokeWidth={2.5} />
      {chip}
    </span>
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-700">
      <Sparkles size={13} className="text-brand-600" />
      {label}
    </span>
  </div>
);

export const PageHeader = ({
  chip,
  chipLabel,
  title,
  accent,
  description,
  actions,
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        {chip ? <HeroBadge chip={chip} label={chipLabel} /> : null}
        <h1 className="mt-4 sm:mt-5 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.15] sm:leading-[1.12] tracking-tight text-ink-900">
          {title}
          {accent ? (
            <>
              {" "}
              <AccentWord>{accent}</AccentWord>
            </>
          ) : null}
        </h1>
        {description ? (
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-500 sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  </div>
);

export const SectionHeading = ({ title, description, action }) => (
  <div className="flex items-end justify-between gap-4 border-b border-ink-900/[0.08] px-5 py-4 sm:px-6">
    <div>
      <h2 className="font-display text-[15px] font-bold leading-tight text-ink-900">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-[12.5px] text-ink-500">{description}</p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

/* ───────────────────────────────── controls ───────────────────────────────── */
/* Button styles mirror the landing hero CTAs (dark pill + circular chip). */

const BTN_BASE =
  "group inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0";

const BTN_SIZE = {
  sm: "pl-5 pr-1.5 py-1.5 text-[12.5px]",
  md: "pl-6 pr-2 py-2 text-[13.5px]",
  lg: "pl-7 pr-2.5 py-2.5 text-[15px]",
  icon: "h-9 w-9",
};

const BTN_VARIANT = {
  primary: "bg-ink-900 text-white shadow-pop hover:bg-brand-600 hover:shadow-card hover:-translate-y-0.5",
  brand: "bg-brand-600 text-white shadow-pop hover:bg-brand-700 hover:-translate-y-0.5",
  secondary:
    "border border-ink-900/10 bg-white text-ink-800 shadow-soft hover:shadow-card hover:-translate-y-0.5",
  subtle: "border border-ink-900/10 bg-paper text-ink-800 hover:bg-white hover:shadow-soft",
  ghost: "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
  danger: "bg-rose-600 text-white shadow-soft hover:bg-rose-700",
};

/* Circular chip rendered inside primary/brand buttons (the landing signature). */
const Chip = ({ children }) => (
  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 transition-colors group-hover:bg-white group-hover:text-ink-900">
    {children}
  </span>
);

export const Button = ({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...rest
}) => {
  const chip = variant === "primary" || variant === "brand";
  return (
    <button className={`${BTN_BASE} ${BTN_SIZE[size]} ${BTN_VARIANT[variant]} ${className}`} {...rest}>
      {children}
      {chip && icon ? <Chip>{icon}</Chip> : null}
    </button>
  );
};

export const ButtonLink = ({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...rest
}) => {
  const chip = variant === "primary" || variant === "brand";
  return (
    <a className={`${BTN_BASE} ${BTN_SIZE[size]} ${BTN_VARIANT[variant]} ${className}`} {...rest}>
      {children}
      {chip && icon ? <Chip>{icon}</Chip> : null}
    </a>
  );
};

export const IconButton = ({ label, className = "", children, ...rest }) => (
  <button
    aria-label={label}
    title={label}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/[0.10] bg-white text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35 focus-visible:ring-offset-2 disabled:opacity-45 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const BADGE_TONE = {
  neutral: "border-ink-900/[0.08] bg-paper text-ink-600",
  outline: "border-ink-900/[0.10] bg-transparent text-ink-500",
  brand: "border-brand-100 bg-brand-50 text-brand-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
};

export const Badge = ({ tone = "neutral", icon: Icon, className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${BADGE_TONE[tone]} ${className}`}
  >
    {Icon ? <Icon size={12} /> : null}
    {children}
  </span>
);

export const SearchField = ({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <Search
      size={15}
      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
    />
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="h-10 w-full rounded-xl border border-ink-900/[0.10] bg-white pl-9 pr-3.5 text-[13px] font-medium text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    />
  </div>
);

export const FilterChips = ({ options, value, onChange, className = "" }) => (
  <div className={`no-scrollbar flex items-center gap-1.5 overflow-x-auto ${className}`}>
    {options.map((option) => {
      const active = option === value;
      return (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`h-9 shrink-0 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors ${
            active
              ? "border-ink-900 bg-ink-900 text-white"
              : "border-ink-900/[0.10] bg-white text-ink-600 hover:border-ink-900/20 hover:text-ink-900"
          }`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

export const SegmentedControl = ({ options, value, onChange, className = "" }) => (
  <div
    className={`inline-flex items-center gap-1 rounded-xl border border-ink-900/[0.08] bg-paper p-1 ${className}`}
  >
    {options.map((option) => {
      const active = option.value === value;
      const Icon = option.icon;
      return (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition-all ${
            active
              ? "bg-white text-ink-900 shadow-[0_1px_2px_rgba(19,19,40,0.08)]"
              : "text-ink-500 hover:text-ink-900"
          }`}
        >
          {Icon ? <Icon size={14} /> : null}
          {option.label}
        </button>
      );
    })}
  </div>
);

export const ProgressBar = ({ value = 0, tone = "brand", className = "" }) => {
  const fill =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : tone === "ink"
          ? "bg-ink-900"
          : "bg-brand-500";
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-ink-900/[0.08] ${className}`}>
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-500`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action, className = "" }) => (
  <div
    className={`${SURFACE} flex flex-col items-center px-6 py-14 text-center ${className}`}
  >
    {Icon ? (
      <span className="mb-3.5 grid h-12 w-12 place-items-center rounded-2xl border border-ink-900/[0.08] bg-paper text-ink-500">
        <Icon size={22} />
      </span>
    ) : null}
    <h3 className="font-display text-[16px] font-bold text-ink-900">{title}</h3>
    {description ? (
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500">{description}</p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-ink-900/[0.06] ${className}`} />
);

export const SkeletonRows = ({ rows = 3, className = "" }) => (
  <div className={`${SURFACE} divide-y divide-ink-900/[0.06] ${className}`}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-start gap-4 px-5 py-4 sm:px-6">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonCards = ({ count = 3, className = "" }) => (
  <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={`${SURFACE} p-5`}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3.5 h-4 w-3/4" />
        <Skeleton className="mt-2.5 h-3 w-full" />
        <Skeleton className="mt-5 h-9 w-full rounded-full" />
      </div>
    ))}
  </div>
);

export const FieldLabel = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400"
  >
    {children}
  </label>
);

export const inputClass =
  "h-10 w-full rounded-xl border border-ink-900/[0.10] bg-white px-3.5 text-[13px] font-medium text-ink-900 placeholder:text-ink-400 transition-all focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export const selectClass = `${inputClass} appearance-none bg-[url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B6B8A' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10`;
