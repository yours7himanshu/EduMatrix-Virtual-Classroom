import React, { ReactNode } from "react";
import stats from "../utils/Stats";

interface Stat {
  number: string;
  label: string;
  icon: ReactNode;
}

const StatSection: React.FC = () => {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((stat: Stat, index: number) => (
            <div
              key={index}
              className="text-center bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-ink-900/10 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300"
              data-aos="fade-up"
            >
              <div className="mx-auto mb-3 sm:mb-4 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl bg-brand-50 border border-brand-600/10 text-brand-600">
                {stat.icon}
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-ink-900 mb-0.5 sm:mb-1">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-ink-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatSection;
