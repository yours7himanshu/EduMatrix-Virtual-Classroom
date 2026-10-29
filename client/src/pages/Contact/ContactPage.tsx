import React from 'react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown, ArrowUpRight, MessageSquare } from 'lucide-react';
import axios from 'axios';
import faqData from './faqData.ts';
import ServiceLayout from '../../layout/ServiceLayout.jsx';
import { toast } from 'react-toastify';

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

const FAQItem = ({ question, answer, index }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="border-b border-ink-900/10 py-3.5 sm:py-5 last:border-0">
      <button
        id={buttonId}
        type="button"
        className="flex min-h-[44px] justify-between items-center w-full py-1 text-left gap-3"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="text-[15px] sm:text-base md:text-lg font-bold text-ink-900 leading-snug">{question}</span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 border border-brand-600/10 ml-2 sm:ml-4 transition-colors">
          <ChevronDown className={`w-5 h-5 text-brand-600 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="pt-1 pb-1 text-ink-500 text-sm md:text-base leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

interface formDataState {
  fullName: string;
  email: string;
  description: string;
}

interface InfoItem {
  icon: React.ElementType;
  title: string;
  sub: string;
  href?: string;
  target?: string;
}

const ContactPage = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [searchParams] = useSearchParams();
  const course = searchParams.get('course');
  const [formData, setFormData] = useState<formDataState>(() => ({
    fullName: '',
    email: '',
    description: course ? `I'd like to know more about the ${course} program.` : '',
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendURL}/api/feedback`, formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({ fullName: '', email: '', description: '' });
      }
    } catch (error) {
      console.log('Some error occured on sending feedback to the admin', error);
      if (error.response?.data?.message) { toast.error(error.response.data.message); }
      else { toast.error('Internal Server Error'); }
    }
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const info: InfoItem[] = [
    { icon: Mail, title: 'Email us', sub: 'support@edumatrix.live', href: 'mailto:support@edumatrix.live' },
    { icon: Phone, title: 'Call us', sub: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    {
      icon: MapPin,
      title: 'Visit us',
      sub: '123 Education Street, Tech Valley',
      href: 'https://maps.google.com/?q=123+Education+Street+Tech+Valley',
      target: '_blank',
    },
    { icon: Clock, title: 'Business hours', sub: 'Mon – Fri: 9:00 AM – 6:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink-900 antialiased overflow-x-clip">
      <section className="hero-fade relative pt-24 sm:pt-32 pb-10 sm:pb-12 px-4 sm:px-6 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
        <div aria-hidden="true" className="absolute -top-24 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute top-10 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <p className="inline-block rounded-full bg-white border border-ink-900/10 shadow-soft text-ink-600 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">
            GET IN TOUCH
          </p>
          <h1 className="font-display text-[2.5rem] leading-[1.05] min-[420px]:text-4xl md:text-6xl font-extrabold tracking-tight text-ink-900 mt-4 text-balance">
            Let&rsquo;s{' '}
            <span className="relative inline-block">
              <span className="font-display italic font-bold text-brand-600">talk</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 14 Q 32 4 60 10 T 116 8" stroke="#D4F34E" strokeWidth="7" strokeLinecap="round" />
                <path d="M4 14 Q 32 4 60 10 T 116 8" stroke="#5B50E6" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-4 text-ink-500 text-[15px] sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-balance">
            We are here to help and answer any questions you might have about the classroom, your account or a program.
          </p>

          {/* Tap-to-contact strip (mobile): one-tap call + email */}
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto sm:hidden">
            <a href="tel:+15551234567" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink-900 text-white text-sm font-bold shadow-soft active:scale-[0.99] transition-transform">
              <Phone className="w-4 h-4" /> Call us
            </a>
            <a href="mailto:support@edumatrix.live" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white border border-ink-900/15 text-sm font-bold text-ink-900 shadow-soft active:scale-[0.99] transition-transform">
              <Mail className="w-4 h-4 text-brand-600" /> Email us
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-4 sm:gap-6">
          {/* Contact channels: compact 2-up on phones, calm stacked cards on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 content-start">
            {info.map((c) => {
              const Tag = (c.href ? 'a' : 'div') as React.ElementType;
              const linkProps = c.href
                ? { href: c.href, ...(c.target ? { target: c.target, rel: 'noopener noreferrer' } : {}) }
                : {};

              return (
                <Tag
                  key={c.title}
                  {...linkProps}
                  className={`group relative flex flex-col justify-between gap-3 rounded-[1.25rem] sm:rounded-3xl border border-ink-900/10 bg-white p-4 sm:p-5 shadow-soft transition-all duration-300 ${
                    c.href ? 'hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-brand-50 border border-brand-600/10 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <c.icon className="w-5 h-5" />
                    </span>
                    {c.href ? (
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="mt-1 text-ink-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-[14.5px] sm:text-base font-extrabold text-ink-900 leading-tight">{c.title}</h2>
                    <p className="mt-1 text-ink-500 text-[11.5px] min-[400px]:text-[12.5px] sm:text-sm font-medium leading-snug [overflow-wrap:anywhere]">
                      {c.sub}
                    </p>
                  </div>
                </Tag>
              );
            })}
          </div>

          <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-card p-5 sm:p-7 md:p-8">
            <div className="flex items-start gap-3">
              <span className="hidden sm:grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-accent-lime">
                <MessageSquare size={18} />
              </span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-ink-900">Send us a message</h2>
                <p className="mt-1 text-[12.5px] sm:text-[13px] font-medium text-ink-500">
                  We usually reply within one business day.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-ink-900 mb-2" htmlFor="name">Full name</label>
                <input type="text" id="name" name="fullName" autoComplete="name" value={formData.fullName} onChange={handleChange} placeholder="Jane Cooper" className="w-full min-h-[48px] px-4 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-ink-900 mb-2" htmlFor="email">Email address</label>
                <input type="email" id="email" name="email" autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange} placeholder="jane@college.edu" className="w-full min-h-[48px] px-4 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <div>
                <label className="block text-[13px] sm:text-sm font-bold text-ink-900 mb-2" htmlFor="message">Message</label>
                <textarea id="message" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="How can we help?" className="w-full min-h-[120px] px-4 py-3 bg-paper text-base sm:text-sm text-ink-900 border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" required />
              </div>
              <button type="submit" className="w-full min-h-[52px] bg-ink-900 text-white py-3.5 px-6 rounded-full font-bold text-[15px] hover:bg-brand-600 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                <span>Send message</span>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-white rounded-[1.5rem] sm:rounded-3xl border border-ink-900/10 shadow-soft p-5 sm:p-7 md:p-10">
          <div className="text-center">
            <span className="inline-block rounded-full bg-brand-50 border border-brand-600/15 text-brand-700 text-[11px] font-extrabold tracking-[0.16em] px-4 py-1.5">FAQ</span>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-ink-900 mt-4 mb-3 sm:mb-5">Frequently asked questions</h2>
            <p className="text-sm text-ink-500 mb-4 sm:mb-6">
              Still curious?{' '}
              <Link to="/courses" className="font-bold text-brand-700 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-600">
                Browse the course catalogue
              </Link>
              .
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {faqData.map((faq, index) => (
              <FAQItem key={index} index={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
        <div className="pb-12 sm:pb-20" />
      </div>
    </div>
  );
};

export default ServiceLayout()(ContactPage);
