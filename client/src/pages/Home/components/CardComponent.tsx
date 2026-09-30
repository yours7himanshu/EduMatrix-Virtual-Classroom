import React from "react";

interface CardProps {
  title: string;
  discription: string;
  icon: React.ReactNode;
}

// Mobile: flat step rows on a timeline rail (no cards).
// Desktop: original white cards with shadow + hover lift.
const CardComponent: React.FC<CardProps> = ({ title, discription, icon }) => {
  return (
    <div
      data-aos="fade-up"
      className="group relative flex items-start gap-3 border-b border-ink-900/10 py-4 text-left first:pt-0 last:border-b-0 last:pb-0 sm:gap-5 sm:rounded-3xl sm:border sm:border-ink-900/10 sm:bg-white/95 sm:shadow-soft sm:hover:shadow-card sm:hover:-translate-y-0.5 sm:transition-all sm:duration-300 sm:p-6 sm:first:pt-6 sm:last:pb-6 cursor-pointer"
    >
      <div className="grid h-9 w-9 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-lg sm:rounded-2xl bg-ink-900 text-white sm:bg-brand-50 sm:text-brand-600 sm:ring-1 sm:ring-brand-600/15 group-hover:sm:bg-brand-600 group-hover:sm:text-white transition-colors duration-300">
        <span className="leading-none [&>svg]:h-[18px] [&>svg]:w-[18px] sm:[&>svg]:h-6 sm:[&>svg]:w-6">{icon}</span>
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-[14.5px] sm:text-lg font-bold text-ink-900 tracking-tight leading-snug group-hover:sm:text-brand-600 transition-colors">
          {title}
        </h3>
        <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-sm text-ink-500 leading-relaxed">
          {discription}
        </p>
      </div>
    </div>
  );
};

export default CardComponent;
