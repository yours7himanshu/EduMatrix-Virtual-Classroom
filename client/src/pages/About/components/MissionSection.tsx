import React, { ReactNode } from "react";
import values from "../utils/Values";

interface Value {
  title: string;
  icon: ReactNode;
  description: string;
}

const MissionSection: React.FC = () => {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">
            OUR MISSION
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-ink-900 mt-4 mb-5">
            Education that empowers everyone
          </h2>
          <p className="text-ink-500 mb-12">
            To empower educational institutions with cutting-edge technology solutions that enhance learning experiences and improve educational outcomes. We believe in making quality education accessible, engaging, and effective for everyone.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <img
            src="/images/about-mission.jpg"
            alt="Teacher leading a class"
            loading="lazy"
            className="w-full h-64 object-cover rounded-3xl border border-ink-900/10 shadow-soft"
          />
          <img
            src="/images/about-story.jpg"
            alt="Student studying with notes"
            loading="lazy"
            className="w-full h-64 object-cover rounded-3xl border border-ink-900/10 shadow-soft"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {values.map((value: Value, index: number) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl border border-ink-900/10 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300"
              data-aos="fade-up"
            >
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 border border-brand-600/10 text-brand-600">
                {value.icon}
              </div>
              <h3 className="font-display text-lg font-extrabold text-ink-900 mb-2 text-center">{value.title}</h3>
              <p className="text-ink-500 text-sm text-center leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
