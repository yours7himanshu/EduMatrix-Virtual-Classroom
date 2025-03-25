import React from 'react';
import { motion } from 'framer-motion';
import milestones from "../utils/milestones.ts";


interface Milestone{
  year:string;
  event:string;
}

const JourneySection: React.FC = () => {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center text-gray-300 mb-16"
        >
          Our Journey
        </motion.h2>

        <div className="max-w-4xl mx-auto">
          {milestones.map((milestone : Milestone, index : number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-start mb-12 last:mb-0"
            >
              <div className="flex-shrink-0 w-32">
                <div className="text-2xl font-bold bg-clip-text text-transparent 
                  bg-gradient-to-r from-purple-400 to-pink-400">
                  {milestone.year}
                </div>
              </div>
              <div className="flex-grow pl-8 border-l-2 border-purple-500/30 relative">
                <div className="absolute -left-[9px] top-[10px] w-4 h-4 bg-purple-500 rounded-full 
                  shadow-lg shadow-purple-500/50"></div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 
                    backdrop-blur-sm border border-purple-500/10 p-6 rounded-xl 
                    shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                >
                  <p className="text-gray-300 text-lg">{milestone.event}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;