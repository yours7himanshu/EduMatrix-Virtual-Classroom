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
    <div className="border-b border-ink-900/10 py-6 last:border-0">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-base md:text-lg font-bold text-ink-900">{question}</span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 border border-brand-600/10 ml-4">
          <ChevronDown className={`w-5 h-5 text-brand-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <div className={`mt-3 text-ink-500 text-sm md:text-base leading-relaxed transition-all duration-300 ${isOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>{answer}</div>
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
    <div className="min-h-screen bg-paper text-ink-900 antialiased">
      <div className="relative pt-32 pb-10 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
        <div className="absolute top-10 -right-24 h-96 w-96 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">GET IN TOUCH</p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-4">Lets talk</h1>
          <p className="mt-4 text-ink-500 text-base md:text-lg max-w-2xl mx-auto">We are here to help and answer any questions you might have.</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            {info.map((c, i) => (
              <div key={i} className="bg-white rounded-3xl border border-ink-900/10 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-6">
                <div className="flex items-center gap-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 border border-brand-600/10">
                    <c.icon className="w-6 h-6 text-brand-600" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-ink-900">{c.title}</h3>
                    <p className="text-ink-500 text-sm font-medium">{c.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl border border-ink-900/10 shadow-card p-7 md:p-8">
            <h2 className="font-display text-2xl font-extrabold text-ink-900 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-ink-900 mb-2" htmlFor="name">Full Name</label>
                <input type="text" id="name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Jane Cooper" className="w-full px-4 py-3 bg-paper text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-900 mb-2" htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@college.edu" className="w-full px-4 py-3 bg-paper text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-900 mb-2" htmlFor="message">Message</label>
                <textarea id="message" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="How can we help?" className="w-full px-4 py-3 bg-paper text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <button type="submit" className="w-full bg-ink-900 text-white py-3.5 px-6 rounded-full font-bold text-[15px] hover:bg-brand-600 transition-all duration-300 flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 bg-white rounded-3xl border border-ink-900/10 shadow-soft p-7 md:p-10">
          <p className="text-center inline-block w-full"><span className="inline-block rounded-full bg-brand-50 border border-brand-600/15 text-brand-700 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">FAQ</span></p>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 mt-4 mb-6 text-center">Frequently Asked Questions</h2>
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
