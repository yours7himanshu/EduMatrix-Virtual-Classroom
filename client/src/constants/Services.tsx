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

import React, { ReactNode, useState } from 'react';
import { useEffect } from 'react';
import AOS from "aos";
import { ChevronDown } from "lucide-react";
import services from '../pages/About/utils/Services';

interface serviceType {
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
}

/* One card: full feature list on roomy screens, collapsed behind a
   "What's included" expander on phones so cards stay compact. */
const ServiceCard: React.FC<{ service: serviceType; index: number }> = ({ service, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={String((index % 3) * 100)}
      data-aos-duration="700"
      className="group bg-white rounded-[1.25rem] sm:rounded-3xl border border-ink-900/10 shadow-soft motion-safe:hover:shadow-card motion-safe:hover:-translate-y-1 transition-all duration-300 p-4 sm:p-7"
    >
      {/* Mobile: icon beside a compact heading block. Desktop: centered stack. */}
      <div className="flex items-start gap-3 text-left sm:block sm:text-center">
        <div className="h-10 w-10 shrink-0 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-brand-50 text-brand-600 grid place-items-center sm:mx-auto sm:mb-5 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
          {service.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-[15.5px] sm:text-lg font-bold text-ink-900 leading-snug mb-1 sm:mb-2.5">
            {service.title}
          </h3>
          <p className="text-[12.5px] sm:text-sm text-ink-500 leading-relaxed sm:mb-5">
            {service.description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 flex min-h-[44px] items-center gap-1.5 rounded-full bg-paper px-4 text-[12.5px] font-bold text-brand-700 transition-colors active:scale-95 min-[480px]:hidden"
      >
        What's included ({service.features.length})
        <ChevronDown size={14} className={`transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} min-[480px]:grid-rows-[1fr]`}>
        <div className="overflow-hidden">
          <ul className="space-y-2 sm:space-y-2.5 border-t border-ink-900/5 mt-3 sm:mt-0 pt-3 sm:pt-5">
            {service.features.map((feature, featureIndex: number) => (
              <li key={featureIndex} className="flex items-start gap-2.5 text-[12.5px] sm:text-[13px] font-medium text-ink-600">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  useEffect(() => {
    AOS.init({ once: true, duration: 700 });
  }, []);

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
      {services.map((service: serviceType, index: number) => (
        <ServiceCard key={index} service={service} index={index} />
      ))}
    </div>
  );
};

export default Services;
