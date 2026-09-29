import { useState } from 'react';
import React from 'react';
import { Search, Clock, ArrowRight, GraduationCap, X, ChevronDown } from 'lucide-react';
import courses from './utils/courses.ts';
import categories from './utils/categories.ts';
import ServiceLayout from '../../layout/ServiceLayout.jsx';

const CourseCard = ({ course }) => {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE = 3;
  const hidden = course.specializations.length - VISIBLE;
  const specs = expanded ? course.specializations : course.specializations.slice(0, VISIBLE);
  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-soft motion-safe:hover:shadow-card motion-safe:hover:-translate-y-1 transition-all duration-300 p-5 sm:p-7 flex flex-col">
      <div className="mb-4 sm:mb-5">
        <h3 className="font-display text-lg sm:text-xl font-extrabold text-ink-900 mb-1">{course.name}</h3>
        <p className="text-[13px] sm:text-sm text-ink-500">{course.fullName}</p>
      </div>
      <div className="flex items-center gap-2 mb-4 sm:mb-5 text-[13px] sm:text-sm text-ink-500 font-semibold">
        <Clock className="h-4 w-4 shrink-0 text-brand-600" />
        <span>{course.duration}</span>
      </div>
      <div className="mb-4 sm:mb-5 flex-1">
        <h4 className="text-[11px] sm:text-xs font-extrabold tracking-widest text-ink-500 mb-2.5 sm:mb-3">SPECIALIZATIONS</h4>
        <div className="flex flex-wrap gap-2">
          {specs.map((spec, index) => (
            <span key={index} className="text-[11.5px] sm:text-xs font-semibold bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full border border-brand-600/15">{spec}</span>
          ))}
        </div>
        {hidden > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2.5 inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-[12.5px] font-bold text-brand-700 transition-colors hover:bg-brand-50 active:scale-95"
          >
            {expanded ? "Show less" : `+${hidden} more`}
            <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        ) : null}
      </div>
      <button className="w-full mt-1 inline-flex min-h-[48px] items-center justify-center gap-2 py-3 bg-ink-900 text-white rounded-full font-bold text-sm hover:bg-brand-600 transition-all duration-300 active:scale-[0.99]">
        <span>View Details</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};


const CoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredCourses = courses
    .filter((category) => selectedCategory === 'All' || category.category === selectedCategory)
    .map((category) => ({
      ...category,
      courses: category.courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.specializations.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((category) => category.courses.length > 0);
  const degreeImgs = [
    { src: '/images/graduation.jpg', label: 'Undergraduate', blurb: 'Bachelors programs' },
    { src: '/images/library.jpg', label: 'Postgraduate', blurb: 'Masters programs' },
    { src: '/images/study-notes.jpg', label: 'Doctoral', blurb: 'Research tracks' },
    { src: '/images/campus-students.jpg', label: 'Diploma', blurb: 'Skill certificates' },
  ];
  const totalResults = filteredCourses.reduce((n, c) => n + c.courses.length, 0);
  const hasFilter = searchQuery !== '' || selectedCategory !== 'All';
  return (
    <div className="min-h-screen bg-paper text-ink-900 antialiased overflow-x-clip">
      <div className="relative pt-24 sm:pt-32 pb-8 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
        <div className="absolute top-10 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto text-center">
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">EXPLORE PROGRAMS</p>
          <h1 className="font-display text-[2.5rem] leading-[1.05] min-[420px]:text-4xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-4 text-balance">Professional Degree Programs</h1>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-ink-500 text-[15px] sm:text-base md:text-lg leading-relaxed">Shape your future with our comprehensive range of professional courses.</p>
          {/* Mobile: swipeable degree rail. Desktop: 4-up grid (unchanged). */}
          <div className="mt-8 sm:mt-10">
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 min-[480px]:mx-0 min-[480px]:px-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:mx-auto sm:max-w-4xl">
              {degreeImgs.map((d, i) => (
                <div key={i} className="group w-[150px] min-[480px]:w-[170px] shrink-0 snap-start overflow-hidden rounded-[1.25rem] sm:rounded-3xl border border-ink-900/10 bg-white shadow-soft sm:w-auto motion-safe:hover:shadow-card motion-safe:hover:-translate-y-1 transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img className="h-24 min-[480px]:h-28 sm:h-40 w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" src={d.src} alt={d.label} loading="lazy" />
                    <span className="absolute left-2 top-2 rounded-full bg-ink-900/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">0{i + 1}</span>
                  </div>
                  <p className="py-2 sm:py-3 px-2 text-[12.5px] sm:text-sm font-bold text-ink-900 leading-tight">{d.label}<span className="block text-[10.5px] sm:text-xs font-semibold text-ink-400">{d.blurb}</span></p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11.5px] font-semibold text-ink-400 sm:hidden">Swipe to explore pathways</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center mb-8 sm:mb-12">
        <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-soft w-full md:w-[88%] p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
              <input type="text" placeholder="Search courses or specializations..." aria-label="Search courses" className="w-full min-h-[48px] pl-12 pr-10 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery ? (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900 active:scale-95">
                  <X size={16} />
                </button>
              ) : null}
            </div>
            <select aria-label="Filter by category" className="min-h-[48px] w-full px-4 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold md:w-auto" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p aria-live="polite" className="text-[12.5px] sm:text-[13px] font-semibold text-ink-500">
              {totalResults} {totalResults === 1 ? "program" : "programs"}{hasFilter ? " match your filters" : " available"}
            </p>
            {hasFilter ? (
              <button type="button" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-bold text-brand-700 transition-colors hover:bg-brand-50 active:scale-95">
                <X size={14} /> Clear filters
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((category) => (
            <div key={category.id} className="mb-10 sm:mb-14">
              <div className="mb-5 sm:mb-7 flex items-center gap-3 sm:gap-4">
                <span className="grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 border border-brand-600/10"><GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-brand-600" /></span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-ink-900 leading-tight">{category.category}</h2>
                  <p className="text-[12px] sm:text-[13px] font-semibold text-ink-400">{category.courses.length} {category.courses.length === 1 ? "program" : "programs"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {category.courses.map((course, idx) => (
                  <CourseCard key={idx} course={course} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-14 sm:py-20 px-6 bg-white rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-soft">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-ink-900 mb-2">No courses found</h3>
            <p className="text-sm sm:text-base text-ink-500">Try adjusting your search or filters</p>
            <button type="button" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-bold text-white transition-all hover:bg-brand-600 active:scale-[0.99]">
              Clear search & filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLayout()(CoursesPage);

