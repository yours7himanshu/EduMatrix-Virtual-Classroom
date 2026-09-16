// Copyright 2024 Himanshu Dinkar
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

import React, { ReactNode } from 'react';
import { useEffect } from 'react';
import AOS from "aos";
import services from '../pages/About/utils/Services';

interface serviceType {
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
}

const Services: React.FC = () => {
  useEffect(() => {
    AOS.init({ once: true, duration: 700 });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service: serviceType, index: number) => (
        <div
          key={index}
          data-aos="fade-up"
          data-aos-delay={String((index % 3) * 100)}
          data-aos-duration="700"
          className="group bg-white rounded-3xl border border-ink-900/10 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-7"
        >
          <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-5 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
            {service.icon}
          </div>
          <h3 className="font-display text-lg font-bold text-ink-900 text-center mb-2.5">
            {service.title}
          </h3>
          <p className="text-sm text-ink-500 text-center leading-relaxed mb-5">
            {service.description}
          </p>
          <ul className="space-y-2.5 border-t border-ink-900/5 pt-5">
            {service.features.map((feature, featureIndex: number) => (
              <li key={featureIndex} className="flex items-start gap-2.5 text-[13px] font-medium text-ink-600">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Services;
