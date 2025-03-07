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
import classroomImage from '../../../assets/classroomImage.jpg';
import React from 'react';
import { motion } from 'framer-motion';
import '../CSS/HomePage.css';

const features = [
  // { icon: "💎", text: "Role based Admin features" },
  { icon: "💎", text: "Add teachers and students in your Virtual College" },
  { icon: "💎", text: "Upload Assignment and Quizes for your Students" },
  { icon: "💎", text: "Manage your College Timetable and Announcements" },
  { icon: "💎", text: "View and Download your College Reports" },
  { icon: "💎", text: "Go Live feature for teaching your Students" }
];

const DashboardSection = () => {
  return (
    <section className="py-20 px-6 flex items-center justify-center bg-gradient-to-b min-h-screen from-gray-950 to-slate-900 relative overflow-hidden ">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="relative group"
          >
            <div className="absolute inset-0 h-full bg-blue-500/30 blur-3xl rounded-3xl group-hover:blur-2xl transition-all duration-300"></div>
            <img 
              className='rounded-2xl shadow-2xl relative h-[450px] object-cover w-[100%] z-10 border border-blue-500/20 
                transform transition-transform duration-500 group-hover:scale-[1.02]'
              src={classroomImage} 
              alt="Admin Dashboard" 
            />
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h2 className='text-7xl mb-6 font-bold text-blue-200'>
              Interactive Admin Dashboard for College Faculty
            </h2>
            
            <motion.ul className='space-y-2 text-sm'>
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-300"
                >
                  <span className="text-md">{feature.icon}</span>
                  <span className="text-md">{feature.text}</span>
                </motion.li>
              ))}
            </motion.ul>

           
          </motion.div>
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default DashboardSection;
