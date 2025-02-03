import React, { ReactNode } from 'react';
import stats from "../utils/Stats";

interface Stat{
number:string;
label:string;
icon:ReactNode
}

const StatSection : React.FC = () => {
  return (
    <section className="  bg-gradient-to-b   ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat : Stat, index:number) => (
            <div
              key={index}
              className="text-center bg-slate-900 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105"
              data-aos="fade-up"
            >
              <div className="flex justify-center mb-4 text-violet-500">{stat.icon}</div>
              <div className="text-4xl font-bold text-gray-300 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatSection;