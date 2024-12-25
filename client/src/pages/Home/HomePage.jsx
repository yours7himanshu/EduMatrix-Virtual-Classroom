import mainImage from "../../assets/What-is-a-Virtual-Classroom-3.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Buttons from "../../shared/Buttons/Buttons";
import Services from "../../constants/Services";
import Footer from "../../shared/Footer/Footer";
const HomePage = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-950 via-violet-800 to-indigo-950  p-4 b">
      {/* Header */}

      {/* Hero  section of the website of the home page */}
      <section className="bg-gradient-to-r mt-36  h-screen max-md:h-auto text-white py-10 px-6 rounded-md mb-6">
        <div className="container  h-[90%] max-md:h-[70%] mx-auto flex flex-col md:flex-row items-center justify-center">
          <div className=" w-[90%]  h-[95%]  max-lg:w-screen  mb-[10%] flex flex-col items-center justify-center space-y-6 text-center md:text-left">
            <h1
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-6xl max-lg:w-screen  leading-[107%]  mb-2  max-lg:tracking-wider text-center font-extrabold max-md:mx-4 max-lg:text-4xl max-lg:font-bold "
            >
              <span className="text-6xl max-lg:text-4xl max-lg:font-bold  text-center p-2 font-extrabold text-cyan-300">
                {" "}
                Empowering
              </span>{" "}
              Interactive and Seamless Virtual{" "}
              <span className="text-6xl font-extrabold text-lime-400 max-lg:text-4xl max-lg:font-bold ">
                {" "}
                Learning
              </span>{" "}
              Experiences Online through{" "}
              <span className="text-6xlfont-extrabold text-yellow-300 max-lg:text-4xl max-lg:font-bold ">
                EduMatrix
              </span>
            </h1>
            <p
              data-aos="fade-down"
              data-aos-duration="1500"
              className="text-sm"
            >
              💎 An AI-powered smart education system for a seamless virtual
              classroom experience 💎
            </p>
            <div
              data-aos="fade-down"
              data-aos-duration="1500"
              className="flex flex-wrap justify-center md:justify-start space-x-4"
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
          <h3 className="text-5xl font-bold text-center text-gray-200 mb-16 ">
            Why Choosing Us ???
          </h3>

          {/* resusing teh same service component again */}
          <Services />
        </div>
      </section>

      {/* footer section of the website */}
    </div>
  );
};

export default HomePage;
