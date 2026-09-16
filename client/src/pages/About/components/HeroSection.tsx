import React from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative py-14 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="text-center relative">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5"
          >
            OUR STORY
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-5"
          >
            Transforming Education <span className="italic text-brand-600">Through Technology</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 text-ink-500 text-base md:text-lg max-w-3xl mx-auto leading-relaxed"
          >
            Building the future of learning with innovative virtual classrooms and AI-powered education.
          </motion.p>
          <div className="relative text-left">
            <img
              src="/images/about-hero.jpg"
              alt="Students learning together in a modern classroom"
              loading="lazy"
              className="w-full mt-10 h-[320px] md:h-[420px] object-cover rounded-[2rem] border border-ink-900/10 shadow-card"
            />
            <div className="hidden sm:flex absolute -bottom-6 left-8 items-center gap-3 bg-white/95 glass rounded-2xl border border-ink-900/10 shadow-card p-4 text-left">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 border border-brand-600/10 text-brand-600 font-display font-extrabold text-sm">
                10K+
              </span>
              <span>
                <span className="block font-display font-extrabold text-ink-900 text-sm">Students Enrolled</span>
                <span className="block text-xs text-ink-500 font-medium mt-0.5">Learning every day on EduMatrix</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
