import React from 'react';

const TeamSection : React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600 mb-6">
            Our Team
          </h2>
          <p className="text-lg text-gray-300 mb-12 max-w-3xl mx-auto">
            We're a dedicated team of educators, technologists, and innovators working together to transform education.
          </p>
        </div>
        {/* Placeholder for team members */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, index:number) => (
            <div
              key={index}
              className="bg-slate-900 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105"
              data-aos="fade-up"
            >
              <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Team Member {index + 1}</h3>
              <p className="text-gray-400">Role</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;