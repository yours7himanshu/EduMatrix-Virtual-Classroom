import { useState } from 'react';

import { Mail, Phone, MapPin, Clock, Send, ChevronDown, ExternalLink } from 'lucide-react';
import Footer from '../../shared/Footer/Footer';
import faqData from './faqData.js';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b  border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-800">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      <div className={`mt-2 text-gray-600 transition-all duration-300 ${isOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
        {answer}
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });



  const socialLinks = [
    { name: 'Website', url: '#' },
    { name: 'Support', url: '#' },
    { name: 'Community', url: '#' },
    { name: 'Resources', url: '#' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  

  return (
    <div className="gradient-bg relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-bl from-blue-200 to-transparent opacity-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-200 to-transparent opacity-20 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mt-[5%] mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-violet-600 to-indigo-700 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            We're here to help and answer any questions you might have
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="bg-indigo-950 text-white rounded-lg border/80 border-white-100 shadow-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 backdrop-opacity-0">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-gray-900 font-extralight" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white-300">Email Us</h3>
                  <p className="text-white-100 font-extralight">support@smartedu.com</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-indigo-950 text-white rounded-lg border/80 border-white-100 shadow-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white-300">Call Us</h3>
                  <p className="text-white-100 font-extralight">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-indigo-950 text-white rounded-lg border/80 border-white-100 shadow-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white-300">Visit Us</h3>
                  <p className="text-white-100 font-extralight">123 Education Street, Tech Valley</p>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-indigo-950 text-white rounded-lg border/80 border-white-100 shadow-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white-300">Business Hours</h3>
                  <p className="text-white-100 font-extralight">Mon - Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow duration-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center ">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

      </div>

      {/* Footer with conditional class */}
      <Footer/>
    </div>
  );
};

export default ContactPage;
