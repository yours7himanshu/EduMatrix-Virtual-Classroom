import React from 'react'
import Layout from '../Layout/Layout'
import { FaBook, FaCalendarAlt, FaClipboardList, FaBell, FaChartLine, FaClock } from 'react-icons/fa'

const StudentDashboard = () => {
  // Dummy data for the dashboard
  const stats = [
    { id: 1, title: 'Enrolled Courses', value: '5', icon: <FaBook size={20} /> },
    { id: 2, title: 'Upcoming Assignments', value: '7', icon: <FaClipboardList size={20} /> },
    { id: 3, title: 'Attendance Rate', value: '92%', icon: <FaChartLine size={20} /> },
    { id: 4, title: 'Hours Studied', value: '36', icon: <FaClock size={20} /> },
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
    <div className='p-6 bg-gray-50 w-[80%]'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-blue-800'>Student Dashboard</h1>
        <p className='text-gray-600'>Welcome back! Here's an overview of your academic progress.</p>
      </div>
      
      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {stats.map((stat) => (
          <div key={stat.id} className='bg-white p-4 rounded-lg shadow-md border border-gray-100 flex items-center'>
            <div className='p-3 rounded-full bg-blue-50 text-blue-500 mr-4'>
              {stat.icon}
            </div>
            <div>
              <p className='text-sm text-gray-500'>{stat.title}</p>
              <p className='text-xl font-semibold'>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Upcoming Classes */}
        <div className='lg:col-span-2'>
          <div className='bg-white p-5 rounded-lg shadow-md border border-gray-100 mb-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-800 flex items-center'>
                <FaCalendarAlt className='mr-2 text-blue-500' /> Upcoming Classes
              </h2>
              <button className='text-blue-500 hover:text-blue-700 text-sm'>View All</button>
            </div>
            <div className='divide-y'>
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className='py-3 flex justify-between'>
                  <div>
                    <h3 className='font-medium'>{cls.subject}</h3>
                    <p className='text-sm text-gray-600'>{cls.teacher}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-800'>{cls.date}</p>
                    <p className='text-sm text-gray-600'>{cls.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Course Cards */}
          <div className='bg-white p-5 w-full rounded-lg shadow-md border border-gray-100'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-800'>My Courses</h2>
              <button className='text-blue-500 hover:text-blue-700 text-sm'>View All</button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {courses.map((course) => (
                <div key={course.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                  <h3 className='font-medium mb-2'>{course.name}</h3>
                  <p className='text-sm text-gray-600 mb-3'>Instructor: {course.instructor}</p>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-blue-500 h-2 rounded-full' 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className='flex justify-between mt-2'>
                    <span className='text-xs text-gray-500'>Progress</span>
                    <span className='text-xs font-medium'>{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
     
      </div>
    </div>
  )
}

export default Layout()(StudentDashboard);
