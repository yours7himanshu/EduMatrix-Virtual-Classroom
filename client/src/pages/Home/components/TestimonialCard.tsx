// TestimonialCard - flat editorial on mobile, soft card on desktop.
import React from "react";
import { StarRating } from "./StarRating";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const TestimonialCard = ({
  quote,
  author,
  role = "Student",
  avatarUrl,
}: TestimonialCardProps) => (
  <div className="relative bg-white rounded-xl sm:rounded-2xl border border-ink-900/10 shadow-none sm:shadow-soft hover:sm:shadow-card hover:sm:-translate-y-1 transition-all motion-reduce:transition-none motion-reduce:transform-none duration-300 p-4 sm:p-6 flex flex-col h-full min-w-0">
    <div className="flex items-center gap-2.5 mb-2.5 relative">
      {avatarUrl ? (
        <img src={avatarUrl} alt={author} loading="lazy" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover ring-1 ring-ink-900/10 shrink-0" />
      ) : (
        <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-ink-900 grid place-items-center shrink-0">
          <span className="text-xs sm:text-sm font-bold text-white">{initials(author)}</span>
        </div>
      )}
      <div className="min-w-0">
        <h3 className="truncate font-display text-[13.5px] sm:text-[15px] font-bold text-ink-900">{author}</h3>
        <p className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-ink-500">{role}</p>
      </div>
    </div>
    <StarRating />
    <div className="mt-2 relative flex-1 min-w-0">
      <p className="text-ink-700 text-[13.5px] sm:text-[14.5px] leading-relaxed">&ldquo;{quote}&rdquo;</p>
    </div>
  </div>
);

export default TestimonialCard;
