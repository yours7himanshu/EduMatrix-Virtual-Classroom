import React from 'react';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown } from 'lucide-react';
import axios from 'axios';
import faqData from './faqData.ts';
import ServiceLayout from '../../layout/ServiceLayout.jsx';
import { toast } from 'react-toastify';
interface FAQItemProps { question: string; answer: string; }
const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="border-b border-ink-900/10 py-4 sm:py-6 last:border-0">
      <button
        className="flex min-h-[44px] justify-between items-center w-full py-1 text-left gap-3"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-[15px] sm:text-base md:text-lg font-bold text-ink-900 leading-snug">{question}</span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 border border-brand-600/10 ml-2 sm:ml-4">
          <ChevronDown className={`w-5 h-5 text-brand-600 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="pt-1 pb-1 text-ink-500 text-sm md:text-base leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};
interface formDataState { fullName: string; email: string; description: string; }
const ContactPage = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState<formDataState>({ fullName: '', email: '', description: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendURL}/api/feedback`, formData);
      if (response.data.success) { toast.success(response.data.message); }
    } catch (error) {
      console.log('Some error occured on sending feedback to the admin', error);
      if (error.response?.data?.message) { toast.error(error.response.data.message); }
      else { toast.error('Internal Server Error'); }
    }
  };
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const info = [
    { icon: Mail, title: 'Email Us', sub: 'support@smartedu.com' },
    { icon: Phone, title: 'Call Us', sub: '+1 (555) 123-4567' },
    { icon: MapPin, title: 'Visit Us', sub: '123 Education Street, Tech Valley' },
    { icon: Clock, title: 'Business Hours', sub: 'Mon - Fri: 9:00 AM - 6:00 PM' },
  ];
  return (
    <div className="min-h-screen bg-paper text-ink-900 antialiased overflow-x-clip">
      <div className="relative pt-24 sm:pt-32 pb-8 sm:pb-10 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
        <div className="absolute top-10 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">GET IN TOUCH</p>
          <h1 className="font-display text-[2.5rem] leading-[1.05] min-[420px]:text-4xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-4 text-balance">Lets talk</h1>
          <p className="mt-3 sm:mt-4 text-ink-500 text-[15px] sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">We are here to help and answer any questions you might have.</p>
          {/* Tap-to-contact strip (mobile): one-tap call + email */}
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto sm:hidden">
            <a href="tel:+15551234567" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink-900 text-white text-sm font-bold shadow-soft active:scale-[0.99] transition-transform">
              <Phone className="w-4 h-4" /> Call us
            </a>
            <a href="mailto:support@smartedu.com" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white border border-ink-900/15 text-sm font-bold text-ink-900 shadow-soft active:scale-[0.99] transition-transform">
              <Mail className="w-4 h-4 text-brand-600" /> Email us
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Compact 2-up info grid on phones, roomy list on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-5 content-start">
            {info.map((c, i) => (
              <div key={i} className="bg-white rounded-[1.25rem] sm:rounded-3xl border border-ink-900/10 shadow-soft motion-safe:hover:shadow-card motion-safe:hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6">
                <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center lg:flex-row lg:items-center gap-3 sm:gap-5">
                  <span className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-brand-50 border border-brand-600/10">
                    <c.icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[14.5px] sm:text-lg font-extrabold text-ink-900 leading-tight">{c.title}</h3>
                    <p className="mt-0.5 sm:mt-0 text-ink-500 text-[12px] sm:text-sm font-medium break-words leading-snug">{c.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-card p-5 sm:p-7 md:p-8">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-ink-900 mb-5 sm:mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-ink-900 mb-2" htmlFor="name">Full Name</label>
                <input type="text" id="name" name="fullName" autoComplete="name" value={formData.fullName} onChange={handleChange} placeholder="Jane Cooper" className="w-full min-h-[48px] px-4 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-ink-900 mb-2" htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange} placeholder="jane@college.edu" className="w-full min-h-[48px] px-4 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-ink-900 mb-2" htmlFor="message">Message</label>
                <textarea id="message" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="How can we help?" className="w-full min-h-[120px] px-4 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <button type="submit" className="w-full min-h-[52px] bg-ink-900 text-white py-3.5 px-6 rounded-full font-bold text-[15px] hover:bg-brand-600 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 bg-white rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-soft p-5 sm:p-7 md:p-10">
          <p className="text-center inline-block w-full"><span className="inline-block rounded-full bg-brand-50 border border-brand-600/15 text-brand-700 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">FAQ</span></p>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-ink-900 mt-4 mb-5 sm:mb-6 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
        <div className="pb-20" />
      </div>
    </div>
  );
};
export default ServiceLayout()(ContactPage);
