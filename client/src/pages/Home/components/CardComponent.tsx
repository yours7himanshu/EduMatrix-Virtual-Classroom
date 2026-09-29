import React from "react";

interface CardProps {
  title: string;
  discription: string;
  icon: React.ReactNode;
}

const CardComponent: React.FC<CardProps> = ({ title, discription, icon }) => {
  return (
    <div
      data-aos="fade-up"
      className="group relative bg-white/95 rounded-[1.25rem] sm:rounded-3xl border border-ink-900/10 shadow-soft motion-safe:hover:shadow-card motion-safe:hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-6 text-left flex items-start gap-3 sm:gap-5 cursor-pointer"
    >
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-brand-50 text-brand-600 shrink-0 grid place-items-center ring-1 ring-brand-600/15 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
        <span className="text-lg sm:text-xl leading-none [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">{icon}</span>
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] sm:text-lg font-bold text-ink-900 tracking-tight leading-snug group-hover:text-brand-600 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-[12.5px] sm:text-sm text-ink-500 leading-relaxed">
          {discription}
        </p>
      </div>
    </div>
  );
};

export default CardComponent;
