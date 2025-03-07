import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Buttons from "../../shared/Buttons/Buttons";
import Services from "../../constants/Services";
import VideoSection from "./components/VideoSection";
import DashboardSection from "./components/DashboardSection";
import "./CSS/HomePage.css";
import ServiceLayout from "../../layout/ServiceLayout";
import CardUtils from "./utils/CardUtils";
import CardComponent from "./components/CardComponent.tsx";
import testimonials from "./utils/testimonial.ts";
import { TestimonialCard } from "./components/TestimonialCard";
import gallery4 from "../../assets/gallery4.png";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-b from-slate-950 to-indigo-950 w-full overflow-x-hidden">
      {/* Hero Section */}
      <img
        className="absolute hidden max-md:block max-md:h-[18%] object-cover w-full bg-opacity-70 backdrop-blur-xl inset-0"
        src="/images/pattern2.png"
        alt="pattern"
      />
      <section className="w-full h-screen max-md:h-auto text-white py-10 px-6 mb-6">
        <div className="container max-md:w-full max-md:mx-1 h-screen max-md:h-[100%] flex flex-col items-center">
          <div className="w-[90%] max-md:h-[90%] h-screen max-lg:w-screen max-md:w-full max-md:mt-44 flex flex-col items-center mt-36 space-y-6 text-center">
            <span
              data-aos="fade-down"
              data-aos-duration="1500"
              className="p-1 px-3 border text-purple-200 shadow-purple-700/40 border-purple-400 rounded-3xl text-sm shadow-lg transition-all duration-300 hover:bg-purple-500/10"
            >
              Revolutionizing Digital Education
            </span>
            <h1
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-6xl font-semibold z-30 max-lg:w-full max-md:w-screen leading-[107%] mb-2 max-md:tracking-tight max-lg:tracking-tighter text-center max-lg:text-4xl max-md:text-3xl max-lg:font-bold text-gray-300"
            >
              Empowering Interactive and Seamless Virtual Learning through
              EduMatrix{" "}
            </h1>
            <p
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-sm max-md:w-full text-gray-400 font-medium max-md:mx-3"
            >
              <span className="max-md:hidden">💎</span> An AI-powered smart
              education system for a seamless virtual classroom experience 💎
            </p>
            <div
              data-aos="fade-down"
              data-aos-duration="1500"
              className="flex max-md:flex-col max-md:space-y-4 max-md:space-x-0 max-md:text-sm justify-center space-x-4"
            >
              <Buttons
                className="px-8 outline-none border-none h-13 bg-zinc-300 text-indigo-950 rounded-md font-medium shadow-md hover:bg-gray-100 hover:scale-105 transition-transform duration-300"
                title="Start Demo"
                onClick={()=>navigate('#video')}
              />
              <Buttons
                className="px-8 py-4 h-15 outline-none border-none bg-violet-500 text-white rounded-md shadow-md hover:bg-violet-600 hover:scale-105 transition-transform duration-300"
                title="Get Started"
                onClick={()=>navigate('/MainLogin')}
              />
            </div>
            <div className="flex hero-section-image relative border max-md:w-screen max-md:hidden max-md:h-48 h-[332px] overflow-y-hidden outline-none border-gray-600 w-[90%] justify-center items-start">
              <img
                className="dashboard pt-4 z-40 max-md:w-full absolute outline-none border-none -top-20 p-1 inset-0 object-contain max-md:h-full max-md:top-0 max-md:p-1 h-screen"
                src="/images/dashboard.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-32 max-md:px-4 min-h-[100vh] bg-gradient-to-b from-black mt-[10%]  rounded-md shadow-md"
      >
        <div className="container mt-3 mx-auto">
          <h3 className="text-5xl max-md:text-3xl max-md:mb-10 font-bold text-center text-gray-200 mb-16">
            Why Choose Us?
          </h3>
          <Services />
        </div>
      </section>


      <section className="py-20 px-32 max-md:px-4 min-h-[70vh]  bg-indigo-950">
        <div className="container mx-auto">
          <h3 className="text-5xl max-md:text-3xl font-bold text-center text-gray-200  mb-10 font-sans">
            Explore Our Features
          </h3>

          <div className="flex gap-5 justify-center items-center">
            <div className="flex flex-col gap-3 cursor-pointer">
              {CardUtils.map((props) => (
                <CardComponent {...props} />
              ))}
            </div>

            <div className="image-part ">
              <img
                className="h-[450px]  rounded-lg shadow-lg"
                src={gallery4}
                alt="image of a student"
              />
            </div>
          </div>
        </div>
      </section>

      {/* video section for my hero section */}
      <section id="video" className="py-20 px-32  flex items-center max-md:px-4 min-h-screen bg-gradient-to-b from-slate-950 to-indigo-950 ">
        <VideoSection />
      </section>

      {/* Dashboard Section */}
      <DashboardSection />

      {/* My review section of the website */}
      <section className="py-20 px-32 max-md:px-4 min-h-[90vh]  bg-indigo-950">
        <div className="container mt-12 mx-auto">
          <h3 className="text-5xl max-md:text-3xl font-bold text-center text-gray-200 mb-16">
            What Our Users Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceLayout()(HomePage);
