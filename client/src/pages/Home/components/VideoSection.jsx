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


import React from "react";
import { motion } from "framer-motion";
import '../CSS/HomePage.css'

const VideoSection = () => {
  return (
    <section className="py-16 relative px-6 rounded-xl shadow-2xl bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-900">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto flex gap-12 items-center max-w-7xl max-md:flex-col-reverse"
      >
        <div className="flex-1 space-y-8">
          <motion.h1 
            initial={{ x: -50 }}
            whileInView={{ x: 0 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white max-md:text-3xl"
          >
            Interactive Live Learning Experience
          </motion.h1>
          
          <motion.p 
            initial={{ x: -50 }}
            whileInView={{ x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg leading-relaxed"
          >
            Engage in real-time with interactive live lectures and dynamic chat features. 
            Experience seamless communication between students and teachers in our 
            state-of-the-art virtual classroom environment.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md
              transition-all duration-300 transform text-sm hover:scale-105">
              Try Live Class
            </button>
            <button className="px-6 py-3 border text-sm border-blue-400 text-blue-400 
              hover:bg-blue-400/10 rounded-lg transition-all duration-300">
              Learn More
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="flex-1"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
            <video
              className="rounded-2xl shadow-2xl relative z-10 border border-blue-500/20"
              src="/videos/project.mp4"
              autoPlay
              muted
              loop
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default VideoSection;
