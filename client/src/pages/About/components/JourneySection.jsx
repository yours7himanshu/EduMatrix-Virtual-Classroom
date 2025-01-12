import React from 'react'
import milestones from "../utils/milestones";

const JourneySection = () => {
  return (
    <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Journey
          </h2>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start mb-8 last:mb-0">
                <div className="flex-shrink-0 w-24">
                  <div className="font-bold text-blue-600">
                    {milestone.year}
                  </div>
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
  )
}

export default JourneySection
