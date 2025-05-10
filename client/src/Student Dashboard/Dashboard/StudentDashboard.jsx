import React from 'react'
import Layout from '../Layout/Layout'
import { FaBook, FaCalendarAlt, FaClipboardList, FaChartLine, FaClock } from 'react-icons/fa'

const StudentDashboard = () => {
  // Dummy data for the dashboard
  const stats = [
    { id: 1, title: 'Enrolled Courses', value: '5', icon: <FaBook size={24} />, color: 'bg-blue-500' },
    { id: 2, title: 'Upcoming Assignments', value: '7', icon: <FaClipboardList size={24} />, color: 'bg-green-500' },
    { id: 3, title: 'Attendance Rate', value: '92%', icon: <FaChartLine size={24} />, color: 'bg-purple-500' },
    { id: 4, title: 'Hours Studied', value: '36', icon: <FaClock size={24} />, color: 'bg-orange-500' },
  ]

  const upcomingClasses = [
    { id: 1, subject: 'Advanced Mathematics', time: '10:00 AM - 11:30 AM', date: 'Today', teacher: 'Dr. Johnson' },
    { id: 2, subject: 'Computer Science', time: '01:00 PM - 02:30 PM', date: 'Today', teacher: 'Prof. Williams' },
    { id: 3, subject: 'Physics Lab', time: '09:00 AM - 11:00 AM', date: 'Tomorrow', teacher: 'Dr. Maxwell' },
  ]
  const courses = [
    { id: 1, name: 'Advanced Mathematics', progress: 75, instructor: 'Dr. Johnson' },
    { id: 2, name: 'Computer Science', progress: 60, instructor: 'Prof. Williams' },
    { id: 3, name: 'Physics', progress: 80, instructor: 'Dr. Maxwell' },
    { id: 4, name: 'Literature', progress: 45, instructor: 'Prof. Smith' },
  ]

  return (
    <div className="min-h-screen ml-[5%] bg-gray-50/50 p-8 w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome back! Here&apos;s an overview of your academic progress.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center p-6">
              <div className={`p-4 rounded-lg ${stat.color} bg-opacity-10 mr-4`}>
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Classes */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-3 text-blue-500" /> 
                  Upcoming Classes
                </h2>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-300">
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200 px-2 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800">{cls.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{cls.teacher}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{cls.date}</p>
                      <p className="text-sm text-gray-600 mt-1">{cls.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Course Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-300">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-100"
                  >
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{course.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Instructor: {course.instructor}
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="text-sm font-semibold text-blue-600">{course.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column can be added here for additional content */}
        <div className="hidden lg:block">
          {/* Additional content can be added here */}
        </div>
      </div>
    </div>
  )
}

export default Layout()(StudentDashboard);
