import { useState } from 'react';
import React from 'react';
import { Search, Clock, ArrowRight, GraduationCap } from 'lucide-react';
import courses from './utils/courses.ts';
import categories from './utils/categories.ts';
import ServiceLayout from '../../layout/ServiceLayout.jsx';


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
    { src: '/images/graduation.jpg', label: 'Undergraduate' },
    { src: '/images/library.jpg', label: 'Postgraduate' },
    { src: '/images/study-notes.jpg', label: 'Doctoral' },
    { src: '/images/campus-students.jpg', label: 'Diploma' },
  ];
  return (
    <div className="min-h-screen bg-paper text-ink-900 antialiased">
      <div className="relative pt-32 pb-8 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
        <div className="absolute top-10 -right-24 h-96 w-96 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto text-center">
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">EXPLORE PROGRAMS</p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-4">Professional Degree Programs</h1>
          <p className="mt-4 max-w-2xl mx-auto text-ink-500 text-base md:text-lg">Shape your future with our comprehensive range of professional courses.</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {degreeImgs.map((d, i) => (
              <div key={i} className="bg-white rounded-3xl border border-ink-900/10 shadow-soft overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all duration-300">
                <img className="h-40 w-full object-cover" src={d.src} alt={d.label} loading="lazy" />
                <p className="py-3 text-sm font-bold text-ink-900">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 flex justify-center mb-12">
        <div className="bg-white rounded-3xl border border-ink-900/10 shadow-soft w-full md:w-[88%] p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-ink-400" />
              <input type="text" placeholder="Search courses or specializations..." className="w-full pl-12 pr-4 py-3 bg-paper text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="px-4 py-3 bg-paper text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((category) => (
            <div key={category.id} className="mb-14">
              <div className="flex items-center gap-4 mb-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 border border-brand-600/10"><GraduationCap className="h-6 w-6 text-brand-600" /></span>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900">{category.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.courses.map((course, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-ink-900/10 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-7">
                    <div className="mb-5">
                      <h3 className="font-display text-xl font-extrabold text-ink-900 mb-1">{course.name}</h3>
                      <p className="text-sm text-ink-500">{course.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-5 text-sm text-ink-500 font-semibold">
                      <Clock className="h-4 w-4 text-brand-600" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="mb-5">
                      <h4 className="text-xs font-extrabold tracking-widest text-ink-500 mb-3">SPECIALIZATIONS</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.specializations.map((spec, index) => (
                          <span key={index} className="text-xs font-semibold bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full border border-brand-600/15">{spec}</span>
                        ))}
                      </div>
                    </div>
                    <button className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 bg-ink-900 text-white rounded-full font-bold text-sm hover:bg-brand-600 transition-all duration-300">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-ink-900/10 shadow-soft">
            <h3 className="font-display text-2xl font-extrabold text-ink-900 mb-2">No courses found</h3>
            <p className="text-ink-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLayout()(CoursesPage);

