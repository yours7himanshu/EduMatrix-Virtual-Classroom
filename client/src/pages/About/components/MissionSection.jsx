import React from 'react'
import values from "../utils/Values";


const MissionSection = () => {
  return (
    <section className="py-16  bg-indigo-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Our Mission
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          To empower educational institutions with cutting-edge technology
          solutions that enhance learning experiences and improve
          educational outcomes. We believe in making quality education
          accessible, engaging, and effective for everyone.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  )
}

export default MissionSection
