import React from "react";
import { motion } from "framer-motion";
import milestones from "../utils/milestones.ts";

interface Milestone {
  year: string;
  event: string;
}

const JourneySection: React.FC = () => {
  return (
    <section className="py-8 sm:py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9 sm:mb-14">
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">
            OUR JOURNEY
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="font-display text-[1.75rem] min-[420px]:text-3xl md:text-5xl font-extrabold tracking-tight text-ink-900 mt-4 text-balance"
          >
            Milestones that shaped us
          </motion.h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {milestones.map((milestone: Milestone, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.24) }}
              className="flex items-start mb-5 sm:mb-8 last:mb-0"
            >
              <div className="flex-shrink-0 w-16 min-[420px]:w-24 md:w-32 pt-1">
                <div className="font-display text-base min-[420px]:text-xl md:text-2xl font-extrabold text-brand-600">
                  {milestone.year}
                </div>
              </div>
              <div className="flex-grow min-w-0 pl-4 min-[420px]:pl-6 sm:pl-8 border-l-2 border-brand-600/20 relative">
                <div
                  aria-hidden="true"
                  className="absolute -left-[9px] top-[18px] w-4 h-4 rounded-full bg-brand-600 shadow-card ring-4 ring-brand-50"
                />
                <div className="bg-white border border-ink-900/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft motion-safe:hover:-translate-y-0.5 hover:shadow-card transition-all duration-300">
                  <p className="text-ink-900 text-[14px] sm:text-base md:text-lg font-medium leading-relaxed">
                    {milestone.event}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
