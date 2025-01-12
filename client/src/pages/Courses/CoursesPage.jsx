/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import  { useState } from 'react';
import { Search, Clock, ArrowRight, GraduationCap } from 'lucide-react';
import courses from './courses';
import categories from './categories';
import Footer from '../../shared/Footer/Footer';

const CoursesPage = () => {
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
      )
    }))
    .filter(category => category.courses.length > 0); // Keep only categories with matching courses

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-r mt-[5%] max-md:w-full w-[83%] mx-auto from-blue-900 via-violet-950 to-indigo-950 text-white py-12 px-6 rounded-md mb-8">
        <div className="max-w-7xl max-md:w-full  mx-auto">
          <h1 className="text-4xl font-bold mb-4">Professional Degree Programs</h1>
          <p className="text-xl text-blue-100">Shape your future with our comprehensive range of professional courses</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or specializations..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(category => (
            <div key={category.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.courses.map((course, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-600 p-6"
                  >
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.fullName}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default CoursesPage;
