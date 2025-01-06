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

import './HomePage.css'

const HomePage = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className=" gradient-bg relative bg-gradient-to-r  overflow-x-hidden bg-opacity-75  p-4 ">
      {/* Header */}
     

      {/* Hero  section of the website of the home page */}
        {/* <img  className="absolute max-md:h-[12%] object-cover w-full bg-opacity-70 backdrop-blur-xl inset-0 " src="/images/pattern2.png" alt="pattern" /> */}
      <section className="bg-gradient-to-r  w-full h-screen max-md:h-auto text-white py-10 px-6 mb-6">
        <div className="container max-md:w-full max-md:mx-1  h-screen max-md:h-[100%] mx-auto flex flex-col  items-center ">
          <div className=" w-[90%]  max-md:h-[90%] h-screen  max-lg:w-screen max-md:w-full max-md:mt-44 flex flex-col items-center mt-48 space-y-6 text-center   ">
            <h1
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-6xl font-semibold z-30 max-lg:w-full max-md:w-screen max-md:  leading-[107%]  mb-2 max-md:tracking-tight max-lg:tracking-tighter text-center    max-lg:text-3xl  max-md:text-3xl max-lg:font-bold text-gray-300 "
            >
              <span className="text-6xl max-lg:text-4xl max-lg:font-bold max-md:text-3xl text-center p-2  ">
                {" "}
                Empowering
              </span>{" "}
              Interactive and Seamless {" "}
              <span className="text-6xl  max-md:text-3xl  max-lg:text-4xl max-lg:font-bold ">
                {" "}
                Virtual Learning
              </span>{" "}
              through{" "}
              <span className="text-6xl  max-md:text-3xl  max-lg:text-4xl max-lg:font-bold max-md:text-wrap max-md:block ">
                EduMatrix
              </span>
            </h1>
            <p
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-sm max-md:w-full text-gray-300 font-medium max-md:mx-3 "
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
                className="px-8 outline-none border-none h-13 bg-zinc-300 text-indigo-950 rounded-md font-medium shadow-md hover:bg-gray-100"
                title="Start Demo"
              />
              <Buttons
                className="px-8 py-4 h-15 outline-none border-none bg-violet-500 text-white rounded-md  shadow-md hover:bg-violet-600"
                title="Get Started"
              />
            </div>
          <div className="flex hero-section-image relative border max-md:w-screen max-md:hidden max-md:h-48  h-[328px] overflow-y-hidden  outline-none border-gray-600 w-[90%] justify-center items-start" >
          <img className=" dashboard z-40 max-md:w-full  absolute outline-none border-none  -top-20 p-2  inset-0 object-contain max-md:h-full max-md:top-0 max-md:p-1  h-screen " src="/images/dashboard.png" alt="" />

          </div>
          </div>
        </div>
      </section>

      {/* features section of the website of homepage */}
      <section
        id="features"
        className="py-10 px-6 mt-[10%]   max-md:mt-[30%] rounded-md mb-6 shadow-md bg-gradient-to-b gradient-bg1"
      >
        <div className="container  mx-auto">
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
      <div className="footer">

      <Footer/>
      </div>
    </div>
  );
};

export default HomePage;
