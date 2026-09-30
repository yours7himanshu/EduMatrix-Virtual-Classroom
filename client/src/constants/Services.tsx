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

/* Mobile: editorial numbered index rows with inline chips (no cards, no toggles).
   Desktop: original white cards with centered icon stack, full feature list. */
const ServiceCard: React.FC<{ service: serviceType; index: number }> = ({ service, index }) => {
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={String((index % 3) * 100)}
      data-aos-duration="700"
      className="group border-b border-ink-900/10 py-5 first:pt-0 last:border-b-0 last:pb-0 sm:border sm:bg-white sm:rounded-3xl sm:border-ink-900/10 sm:shadow-soft sm:hover:shadow-card sm:hover:-translate-y-1 sm:transition-all sm:duration-300 sm:p-7 sm:first:pt-7 sm:last:pb-7"
    >
      <div className="flex items-start gap-3 text-left sm:block sm:text-center">
        <div className="flex flex-col items-center gap-1 shrink-0 sm:block">
          <span aria-hidden="true" className="text-[11px] font-extrabold tabular-nums text-ink-400 sm:hidden">0{index + 1}</span>
          <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-brand-50 text-brand-600 grid place-items-center sm:mx-auto sm:mb-5 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
            {service.icon}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-[15px] sm:text-lg font-bold text-ink-900 leading-snug sm:mb-2.5">
            {service.title}
          </h3>
          <p className="mt-1 sm:mt-0 text-[13.5px] sm:text-sm text-ink-500 leading-relaxed sm:mb-5">
            {service.description}
          </p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2.5 sm:block sm:space-y-2.5 sm:border-t sm:border-ink-900/5 sm:mt-0 sm:pt-5 sm:text-left">
        {service.features.map((feature, featureIndex: number) => (
          <li key={featureIndex} className="flex items-center sm:items-start gap-1.5 sm:gap-2.5 text-[12.5px] sm:text-[13px] font-medium text-ink-600">
            <span aria-hidden="true" className="h-1 w-1 sm:mt-[7px] sm:h-1.5 sm:w-1.5 shrink-0 rounded-full bg-brand-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Services: React.FC = () => {
  useEffect(() => {
    AOS.init({ once: true, duration: 700 });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-6 lg:gap-8">
      {services.map((service: serviceType, index: number) => (
        <ServiceCard key={index} service={service} index={index} />
      ))}
    </div>
  );
};

export default Services;
