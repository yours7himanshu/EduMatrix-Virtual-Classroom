import React from 'react';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown } from 'lucide-react';
import axios from 'axios'
import faqData from './faqData.ts';
import ServiceLayout from '../../layout/ServiceLayout.jsx';
import {toast} from 'react-toastify'

interface FAQItemProps{
  question:string;
  answer:string;
}

const FAQItem = ({ question, answer } : FAQItemProps ) => {
  const [isOpen, setIsOpen] = useState <boolean> (false);
  

  return (
    <div className="border-b border-gray-700 py-6">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-200">{question}</span>
        <ChevronDown
          className={`w-6 h-6 text-gray-200 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      <div
        className={`mt-4 text-gray-300 transition-all duration-300 ${isOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
      >
        {answer}
      </div>
    </div>
  );
};

interface formDataState{
  fullName:string;
  email:string;
  description:string;
}

const ContactPage = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState<formDataState>({
    fullName:'',
    email:'',
    description:'',
  });

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const response = await axios.post(`${backendURL}/api/feedback`,formData);
      if(response.data.success){
        toast.success(response.data.message);
      
      }
    }catch(error){
      console.log("Some error occured on sending feedback to the admin",error);
      if(error.response?.data?.message){
        toast.error(error.response.data.message);
      }

      else{
        toast.error("Internal Server Error")
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
     

    });
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-950 to-indigo-950 min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 m-11 rounded-full bg-gradient-to-bl from-blue-200 to-transparent opacity-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-200 to-transparent opacity-20 blur-3xl" />

      <div className="max-w-6xl mt-11 mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-500 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-300">
            We're here to help and answer any questions you might have
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information Cards */}
          <div className="space-y-8">
            {/* Email Card */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 p-8">
              <div className="flex items-center space-x-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">Email Us</h3>
                  <p className="text-gray-400">support@smartedu.com</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 p-8">
              <div className="flex items-center space-x-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">Call Us</h3>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 p-8">
              <div className="flex items-center space-x-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">Visit Us</h3>
                  <p className="text-gray-400">123 Education Street, Tech Valley</p>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 p-8">
              <div className="flex items-center space-x-6">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">Business Hours</h3>
                  <p className="text-gray-400">Mon - Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600 mb-8">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-violet-500 text-white py-3 px-6 rounded-lg hover:bg-violet-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default ServiceLayout()(ContactPage);