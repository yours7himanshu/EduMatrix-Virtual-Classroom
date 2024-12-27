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


import mainImage from "../../assets/What-is-a-Virtual-Classroom-3.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Buttons from "../../shared/Buttons/Buttons";
import Services from "../../constants/Services";
import Footer from "../../shared/Footer/Footer";
import VideoSection from "./VideoSection";
import DashboardSection from "./DashboardSection";
const HomePage = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="bg-gradient-to-r overflow-x-hidden from-blue-950 via-violet-800 to-indigo-950  p-4 ">
      {/* Header */}

      {/* Hero  section of the website of the home page */}
      <section className="bg-gradient-to-r mt-36  h-screen max-md:h-auto text-white py-10 px-6 mb-6">
        <div className="container max-md:w-full   h-[90%] max-md:h-[100%] mx-auto flex flex-col  items-center justify-center">
          <div className=" w-[90%]   h-[95%]  max-lg:w-screen  mb-[30%] flex flex-col items-center justify-center space-y-6 text-center mt-[20%] ">
            <h1
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-6xl max-lg:w-full   leading-[107%]  mb-2  max-lg:tracking-tighter text-center  font-extrabold  max-lg:text-3xl  max-md:text-2xl max-lg:font-bold "
            >
              <span className="text-6xl max-lg:text-4xl max-lg:font-bold max-md:text-2xl text-center p-2 font-extrabold text-cyan-300">
                {" "}
                Empowering
              </span>{" "}
              Interactive and Seamless {" "}
              <span className="text-6xl font-extrabold max-md:text-2xl text-lime-400 max-lg:text-4xl max-lg:font-bold ">
                {" "}
                Virtual Learning
              </span>{" "}
              Experiences Online through{" "}
              <span className="text-6xl font-extrabold max-md:text-2xl text-yellow-300 max-lg:text-4xl max-lg:font-bold ">
                EduMatrix
              </span>
            </h1>
            <p
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-sm max-md:w-full max-md:mx-3 "
            >
             <span className="max-md:hidden" > 💎</span> An AI-powered smart education system for a seamless virtual
              classroom experience 💎
            </p>
            <div
              data-aos="fade-down"
              data-aos-duration="1500"
              className="flex max-md:space-x-2 max-md:text-sm justify-center  space-x-4"
            >
              <Buttons
                className="px-8 outline-none border-none h-13 bg-white text-indigo-950 rounded-md font-medium shadow-md hover:bg-gray-100"
                title="Start Demo"
              />
              <Buttons
                className="px-8 py-4 h-15 outline-none border-none bg-black text-white rounded-md  shadow-md hover:bg-gray-900"
                title="Get Started"
              />
            </div>
          </div>
        </div>
      </section>

      {/* features section of the website of homepage */}
      <section
        id="features"
        className="py-10 px-6  rounded-md mb-6 shadow-md bg-gradient-to-tr from-indigo-950 via-violet-950  to-blue-900  "
      >
        <div className="container mx-auto">
          <h3 className="text-5xl max-md:text-3xl max-md:mb-10 font-bold text-center text-gray-200 mb-16 ">
            Why Choosing Us ???
          </h3>

          {/* resusing teh same service component again */}
          <Services />
        </div>
      </section>

      {/* Section for Video feature */}

      <VideoSection />

      {/* Section for showing Admin features that already designed
       */}
       <DashboardSection/>

      {/* footer section of the website */}
    </div>
  );
};

export default HomePage;
