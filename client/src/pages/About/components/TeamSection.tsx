import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Github, Quote } from "lucide-react";

const teamMembers = [
  {
    name: "Himanshu Dinkar",
    role: "CEO & Founder",
    image: "/images/myImage.jpeg",
    quote:
      "Education should feel alive — not like a folder of PDFs. EduMatrix brings the classroom, the people and the momentum into one calm place.",
    focus: ["Education", "Product design", "AI for learning"],
  },
];

const TeamSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">
            OUR TEAM
          </p>
          <h2 className="font-display text-[1.75rem] min-[420px]:text-3xl md:text-5xl font-extrabold tracking-tight text-ink-900 mt-4 text-balance">
            Meet our team
          </h2>
          <p className="mt-3 sm:mt-4 text-[14.5px] sm:text-base text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Passionate educators and innovators dedicated to transforming the future of education.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.article
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] border border-ink-900/10 bg-white shadow-card"
            >
              <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl pointer-events-none"
              />

              <div className="relative grid gap-7 p-5 sm:p-8 md:grid-cols-[230px_1fr] md:items-center md:gap-10 md:p-10">
                <div className="relative mx-auto w-full max-w-[240px] md:max-w-none">
                  <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-ink-900/10 bg-brand-50 shadow-soft">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-700 motion-safe:hover:scale-[1.03]"
                    />
                  </div>
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-ink-900/10 bg-accent-lime px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-900 shadow-soft">
                    Founder
                  </span>
                </div>

                <div className="text-center md:text-left">
                  <Quote size={28} className="mx-auto text-brand-200 md:mx-0" aria-hidden="true" />
                  <h3 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-brand-600">{member.role}</p>

                  <blockquote className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-ink-500">
                    “{member.quote}”
                  </blockquote>

                  <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                    {member.focus.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-ink-900/[0.08] bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col items-stretch gap-2.5 min-[420px]:flex-row min-[420px]:items-center md:justify-start">
                    <Link
                      to="/contact"
                      className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink-900 px-5 text-sm font-bold text-white shadow-soft transition-all hover:bg-brand-600 active:scale-[0.99]"
                    >
                      Say hello
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href="https://github.com/yours7himanshu/EduMatrix-Virtual-Classroom"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-ink-900/15 bg-white px-5 text-sm font-bold text-ink-900 transition-colors hover:border-ink-900/30 hover:bg-ink-50"
                    >
                      <Github size={15} />
                      View the project
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}

          <p className="mt-6 text-center text-[12.5px] font-medium text-ink-400">
            Building with educators, students and colleges every day.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
