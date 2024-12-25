import React from 'react';
import { assets } from "../../assets/assets";

const services = [
  {
    title: 'Virtual Classrooms',
    description: 'Interactive virtual classrooms where teachers can conduct live sessions, share materials, and engage with students.',
    imgSrc: `${assets.img1}`,
  },
  {
    title: 'Attendance Management',
    description: 'Real-time attendance tracking and reporting for each class, simplifying the record-keeping process.',
    imgSrc: `${assets.img1}`,
  },
  {
    title: 'Assignment Distribution',
    description: 'Assign, collect, and grade assignments seamlessly within the platform with submission tracking and deadline notifications.',
    imgSrc: `${assets.img1}`,
  },
  {
    title: 'Admin Dashboard',
    description: 'A centralized hub for college administrators to manage user accounts, configure classes, and oversee college activities.',
    imgSrc: `${assets.img1}`,
  },
  {
    title: 'Student Portal',
    description: 'A dedicated space where students can access classes, submit work, and view their progress in real-time.',
    imgSrc: `${assets.img1}`,
  },
];

const ServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-8 ">
        <div className="flex-col justify-center items-center gap-5 align-center pl-px ">
            <h1 className="text-5xl m-4 align-center justify-center text-purple-800 font-bold ">OUR SERVICES:</h1>
        </div>
      {services.map((service, index) => (
        <div
          key={index}
          className={`flex flex-col md:flex-row items-center my-8 ${
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          }`}
        >
          <div className="md:w-1/2 p-8 gap-4 pr-16 ">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">{service.title}</h2>
            <p className="text-gray-700 mb-4">{service.description}</p>
            <button className='px-[5%] py-[2%] items-center mt-[5%] bg-purple-400 text-xl  text-white rounded-2xl shadow-md shadow-purple-500 font-medium item-center hover:scale-105 transition-transform duration-300'>Explore now!</button>
          </div>
          <div className="md:w-1/2 px-8 pl-16 h-[20%]">
            <img 
              src={service.imgSrc}
              alt={service.title}
              className="w-80 h-80 rounded-lg shadow-lg object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicePage;