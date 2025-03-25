import React, { ReactNode } from 'react';
import values from "../utils/Values";

interface Value {

  title:string;
  icon:ReactNode;
  description:string;

}

const MissionSection : React.FC = () => {
  return (
    <section className="py-20 from-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-300 mb-6">
            Our Mission
          </h2>
          <p className="text-md text-gray-400 mb-12">
            To empower educational institutions with cutting-edge technology solutions that enhance learning experiences and improve educational outcomes. We believe in making quality education accessible, engaging, and effective for everyone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value : Value, index:number) => (
              <div
                key={index}
                className="bg-indigo-950 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105"
                data-aos="fade-up"
              >
                <div className="flex justify-center mb-4 text-violet-500">{value.icon}</div>
                <h3 className="text-md font-semibold text-gray-200 mb-4">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;