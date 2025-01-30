
// Copright 2024 Himanshu Dinkar
/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/



import React, { ReactNode } from 'react'
import { useEffect } from 'react';
import AOS from "aos";
import services from '../pages/About/utils/Services'

interface serviceType{
  title:string;
  description:string;
  features:string[];
  icon:ReactNode;
}

const Services :React.FC = () => {
  useEffect(() => {
      AOS.init();
    }, []);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2    lg:grid-cols-3 gap-8">
            {services.map((service :serviceType , index:number) => (
              <div key={index}
              data-aos="fade-right"
              data-aos-duration="1500"
              className=" bg-indigo-950 text-white rounded-lg p-6  shadow-lg hover:shadow-md transition-shadow">
                <div className="flex text-white justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold  mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-300 mb-4 text-center">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature , featureIndex : number) => (
                    <li key={featureIndex} className="flex items-center text-gray-400">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
  )
}

export default Services
