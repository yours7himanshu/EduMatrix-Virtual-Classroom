/*

Copyright 2024 Himanshu Dinkar

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

import React from "react";
import "./css/AboutPage.css";
import HeroSection from "./components/HeroSection";
import StatSection from "./components/StatSection";
import ServiceSection from "./components/ServiceSection";
import MissionSection from "./components/MissionSection";
import JourneySection from "./components/JourneySection";
import TeamSection from "./components/TeamSection";
import ServiceLayout from "../../layout/ServiceLayout";
import Hr from "../../constants/Hr";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white overflow-hidden">
      <div className="relative">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <HeroSection />
          <StatSection />
          
          <Hr/>
          
          <ServiceSection />
          <Hr/>
          <MissionSection />
          <Hr/>

          <JourneySection />
          <Hr/>

          <TeamSection />
        
        </div>
      </div>
    </div>
  );
};

export default ServiceLayout()(AboutPage);
