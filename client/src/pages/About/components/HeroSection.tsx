import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative mt-36  py-14 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-8xl decoration-from-font w-full font-extrabold text-gray-300  "
          >
            Transforming Education Through Technology
          </motion.h1>
          {/* <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className=" text-gray-300 text-md max-w-3xl mx-auto leading-relaxed"
          >
            Building the future of learning with innovative virtual classrooms and AI-powered education.
          </motion.p> */}
         
        </div>
      </motion.div>
    </section>
    
  );
};

export default HeroSection;