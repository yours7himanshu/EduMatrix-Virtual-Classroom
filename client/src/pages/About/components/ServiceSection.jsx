import React from 'react'
import Services from '../../../constants/Services'


const ServiceSection = () => {
  return (
    <section className="py-16 ">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-300 mb-4">
          Our Services
        </h2>
        <p className="text-lg text-gray-200 max-w-3xl mx-auto">
          Discover our comprehensive suite of educational services designed
          to provide an immersive and effective learning experience.
        </p>
      </div>

      {/* section for mapping services */}
      <Services />
    </div>
  </section>
  )
}

export default ServiceSection
