// TestimonialCard.tsx - light premium
import React from "react";
import { StarRating } from "./StarRating";
import { motion } from "framer-motion";

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
  <motion.div
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.35 }}
    className="relative bg-white rounded-[1.25rem] sm:rounded-3xl border border-ink-900/10 shadow-soft motion-safe:hover:shadow-card motion-safe:hover:-translate-y-1 transition-all duration-300 p-4 sm:p-7 flex flex-col h-full"
  >
    <span aria-hidden="true" className="pointer-events-none absolute right-5 top-3 font-display text-[48px] sm:text-[64px] leading-none text-brand-100 select-none">&ldquo;</span>
    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative">
      {avatarUrl ? (
        <img src={avatarUrl} alt={author} loading="lazy" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-brand-100" />
      ) : (
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-brand-600 grid place-items-center shrink-0 shadow-soft">
          <span className="text-sm sm:text-base font-bold text-white">{initials(author)}</span>
        </div>
      )}
      <div className="min-w-0">
        <h3 className="truncate font-display text-[14px] sm:text-[15px] font-bold text-ink-900">{author}</h3>
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-600">{role}</p>
      </div>
    </div>
    <StarRating />
    <div className="mt-3 sm:mt-4 relative flex-1">
      <p className="text-ink-600 text-[13.5px] sm:text-[15px] leading-relaxed relative z-10">&ldquo;{quote}&rdquo;</p>
    </div>
  </motion.div>
);

export default TestimonialCard;
