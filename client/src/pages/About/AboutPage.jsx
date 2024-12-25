

import React from 'react';
import stats from './Stats';
import services from './Services';
import milestones from './milestones';
import values from './Values'
import Services from '../../constants/Services';
import Footer from '../../shared/Footer/Footer';

const AboutPage = () => {
  
 
  

 

  return (
    <div className="min-h-screen mt-14 bg-white">
      {/* Previous sections remain unchanged */}
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About EduMatrix
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to make quality education accessible to everyone through innovative technology and dedicated teaching.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive suite of educational services designed to provide an immersive and effective learning experience.
            </p>
          </div>
         
{/* section for mapping services */}
<Services/>

        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              To empower educational institutions with cutting-edge technology solutions that enhance learning experiences and improve educational outcomes. We believe in making quality education accessible, engaging, and effective for everyone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start mb-8 last:mb-0">
                <div className="flex-shrink-0 w-24">
                  <div className="font-bold text-blue-600">{milestone.year}</div>
                </div>
                <div className="flex-grow pl-8 border-l-2 border-blue-100">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    {milestone.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              We're a dedicated team of educators, technologists, and innovators working together to transform education.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Learn More?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get in touch with us to learn how we can help transform your institution
            </p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Contact Us
            </button>
          </div>
        </div>
      </section>

       {/* Footer */}
     <Footer/>
    </div>
  );
};

export default AboutPage;