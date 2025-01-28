import React from 'react';
import milestones from "../utils/milestones";

const JourneySection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600 mb-12 text-center">
          Our Journey
        </h2>
        <div className="max-w-3xl mx-auto">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-start mb-8 last:mb-0" data-aos="fade-up">
              <div className="flex-shrink-0 w-24">
                <div className="font-bold text-purple-200">
                  {milestone.year}
                </div>
              </div>
              <div className="flex-grow pl-8 border-l-2 border-indigo-900 relative">
                <div className="absolute -left-2.5 top-0 w-5 h-5 bg-indigo-900 rounded-full border-2 border-purple-400"></div>
                <div className="bg-indigo-900 text-gray-300 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {milestone.event}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;