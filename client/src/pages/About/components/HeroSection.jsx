import React from 'react';

const HeroSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-500 mb-6">
            About EduMatrix
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to make quality education accessible to everyone through innovative technology and dedicated teaching.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;