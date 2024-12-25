import mainImage from '../../assets/What-is-a-Virtual-Classroom-3.png';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import Buttons from '../../shared/Buttons/Buttons';
const HomePage = () => {

  useEffect(() => { AOS.init(); }, []);

  return (
    <div className="bg-gradient-to-r from-blue-950 via-violet-800 to-indigo-950  p-4 b">
      {/* Header */}
      

      {/* Hero  section of the website of the home page */}
      <section className="bg-gradient-to-r mt-24  h-screen max-md:h-auto text-white py-10 px-6 rounded-md mb-6">
        <div className="container  h-full max-md:h-[70%] mx-auto flex flex-col md:flex-row items-center justify-center">
          <div className=" w-[90%]  h-[95%]  max-lg:w-screen  mb-[10%] flex flex-col items-center justify-center space-y-6 text-center md:text-left">
            <h1 data-aos="fade-down" data-aos-duration="1500" className="text-6xl max-lg:w-screen  leading-[107%]  mb-2  max-lg:tracking-wider text-center font-extrabold max-md:mx-4 max-lg:text-4xl max-lg:font-bold ">
             <span className='text-6xl max-lg:text-4xl max-lg:font-bold  text-center p-2 font-extrabold text-cyan-300'  > Empowering</span>  Interactive and Seamless Virtual <span className='text-6xl font-extrabold text-lime-400 max-lg:text-4xl max-lg:font-bold '  > Learning</span> Experiences Online through <span className='text-6xlfont-extrabold text-yellow-300 max-lg:text-4xl max-lg:font-bold '  >EduMatrix</span>
            </h1>
            <p data-aos="fade-down" data-aos-duration="1500" className="text-sm">
              An AI-powered smart education system for a seamless virtual
              classroom experience 💎
            </p>
            <div data-aos="fade-down" data-aos-duration="1500" className="flex flex-wrap justify-center md:justify-start space-x-4">
             
              <Buttons  className="px-8 outline-none border-none h-13 bg-white text-indigo-950 rounded-md font-medium shadow-md hover:bg-gray-100" title="Start Demo"/>
              <Buttons className="px-8 py-4 h-15 outline-none border-none bg-black text-white rounded-md  shadow-md hover:bg-gray-900" title="Get Started"/>

            </div>
          </div>
        
        </div>
      </section>

      {/* features section of the website of homepage */}
      <section
        id="features"
        className="py-10 px-6  rounded-md mb-6 shadow-md"
      >
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800">
            Why Choose EduMatrix?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[
              "Smart Attendance Tracking",
              "Interactive Virtual Whiteboard",
              "Personalized Learning Paths",
              "Real-time Analytics",
              "Seamless Collaboration Tools",
              "Cloud-based Secure Data Storage",
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 border rounded-lg shadow-sm hover:shadow-lg text-center"
              >
                <h4 className="text-xl font-semibold text-blue-600">
                  {feature}
                </h4>
                <p className="text-gray-600 mt-2">
                  Unlock the potential of virtual learning with this feature.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
     

      {/* Call-to-Action Section */}
      <section
        id="get-started"
        className="py-10 px-6 bg-blue-600 text-white text-center rounded-md mb-6 shadow-md"
      >
        <h3 className="text-3xl font-bold">Transform Education Today</h3>
        <p className="mt-4">
          Join EduMatrix and take your virtual classroom experience to the next
          level.
        </p>
        <div className="mt-6 space-x-4">
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-100">
            Get Started
          </button>
          <button className="px-6 py-2 bg-blue-800 rounded-lg shadow-md hover:bg-blue-900">
            Request a Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 rounded-md">
        <p>&copy; 2024 EduMatrix. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
