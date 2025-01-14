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

import Footer from "../../shared/Footer/Footer";
import "./css/AboutPage.css";
import HeroSection from "./components/HeroSection";
import StatSection from "./components/StatSection";
import ServiceSection from "./components/ServiceSection";
import MissionSection from "./components/MissionSection";
import JourneySection from "./components/JourneySection";
import TeamSection from "./components/TeamSection";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-indigo-950  mt-14 bg-white">
      {/* Previous sections remain unchanged */}
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatSection />

<hr className="outline-none mx-14 border-t-2 border-indigo-900" />
      {/* New Services Section */}
      <ServiceSection />

      {/* Mission Section */}
      <MissionSection />

      {/* Journey Section */}
      <JourneySection />

      {/* Team Section */}

      <TeamSection />
      <hr  className="outline-none  border-t-2 border-indigo-900 max-md:mx-11 mx-24" />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
