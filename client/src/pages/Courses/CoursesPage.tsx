import { useState } from 'react';
import React from 'react';
import { Search, Clock, ArrowRight, GraduationCap } from 'lucide-react';
import courses from './utils/courses.ts';
import categories from './utils/categories.ts';
import ServiceLayout from '../../layout/ServiceLayout.jsx';
import degree from '../../assets/degree.png';
import degree2 from '../../assets/degree2.jpg';
import degree3 from '../../assets/degree3.jpg';
import degree4 from '../../assets/degree4.jpg';

import './CoursesPage.css'


const CoursesPage:React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCourses = courses
    .filter(category => selectedCategory === 'All' || category.category === selectedCategory)
    .map(category => ({
      ...category,
      courses: category.courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter(category => category.courses.length > 0); // Keep only categories with matching courses

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-indigo-950">
      {/* Hero Section */}
      <div className="pt-24 pb-4 mt-10 px-6 ">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-7xl decoration-from-font font-extrabold text-gray-300 mt-2 ">
            Professional Degree 
          </h1>
          <span className='text-7xl decoration-from-font font-extrabold text-gray-300 block mb-5' >Programs</span>
          {/* <p className="text-lg text-gray-300">
            Shape your future with our comprehensive range of professional courses
          </p> */}
          <div className='flex justify-center' >
          <div className='w-[80%] flex justify-center items-center' >
          <img className='h-60 image-left' src={degree} alt="education degree" />
          <img className='h-60 ' src={degree2} alt="education degree" />
          <img className='h-60 ' src={degree4} alt="education degree" />
          <img className='h-60 image-right ' src={degree3} alt="education degree" />


          </div>
          </div>
        
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 flex justify-center mb-16">
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl w-[88%] shadow-2xl p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or specializations..."
                className="w-full pl-12 pr-4 py-3 bg-slate-900 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 bg-slate-900 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((category) => (
            <div key={category.id} className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <GraduationCap className="h-10 w-10 text-violet-500" />
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600">
                  {category.category}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.courses.map((course, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 p-8"
                  >
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-200 mb-2">{course.name}</h3>
                      <p className="text-sm text-gray-400">{course.fullName}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
                      <Clock className="h-5 w-5" />
                      <span>{course.duration}</span>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="text-xs bg-purple-200/10 text-purple-200 px-3 py-1.5 rounded-full border border-purple-400/20 shadow-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all duration-300">
                      <span>View Details</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-medium text-gray-200 mb-3">No courses found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

     
    </div>
  );
};

export default ServiceLayout()(CoursesPage);