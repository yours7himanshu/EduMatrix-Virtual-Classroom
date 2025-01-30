import React, { ReactNode } from 'react';
import values from "../utils/Values";

interface Value {

  title:string;
  icon:ReactNode;
  description:string;

}

const MissionSection : React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-300 mb-12">
            To empower educational institutions with cutting-edge technology solutions that enhance learning experiences and improve educational outcomes. We believe in making quality education accessible, engaging, and effective for everyone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value : Value, index:number) => (
              <div
                key={index}
                className="bg-slate-900 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105"
                data-aos="fade-up"
              >
                <div className="flex justify-center mb-4 text-violet-500">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-200 mb-4">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;