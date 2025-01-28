import React from 'react';
import Services from '../../../constants/Services';

const ServiceSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover our comprehensive suite of educational services designed to provide an immersive and effective learning experience.
          </p>
        </div>
        <Services />
      </div>
    </section>
  );
};

export default ServiceSection;