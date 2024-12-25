

import React from 'react';
import { 
  Award, 
  Users, 
  Globe, 
  BookOpen, 
  Building, 
  GraduationCap,
  Video,
  ClipboardCheck,
  HelpCircle,
  LineChart,
  MessageCircle,
  Calendar
} from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: "10K+", label: "Students Enrolled", icon: <Users className="w-6 h-6 text-blue-600" /> },
    { number: "500+", label: "Expert Teachers", icon: <GraduationCap className="w-6 h-6 text-blue-600" /> },
    { number: "100+", label: "Courses", icon: <BookOpen className="w-6 h-6 text-blue-600" /> },
    { number: "50+", label: "Partner Institutions", icon: <Building className="w-6 h-6 text-blue-600" /> }
  ];

  const services = [
    {
      title: "Live Interactive Classes",
      description: "Engage in real-time with expert instructors through our interactive virtual classrooms. Experience dynamic learning with live discussions and instant doubt resolution.",
      icon: <Video className="w-12 h-12 text-blue-600" />,
      features: ["Real-time interaction", "Interactive whiteboard", "Live Q&A sessions", "Recorded sessions available"]
    },
    {
      title: "Comprehensive Assignments",
      description: "Strengthen your understanding through carefully crafted assignments that test your knowledge and promote practical application of concepts.",
      icon: <ClipboardCheck className="w-12 h-12 text-blue-600" />,
      features: ["Auto-graded exercises", "Detailed solutions", "Regular feedback", "Progressive difficulty levels"]
    },
    {
      title: "24/7 Doubt Resolution",
      description: "Never let doubts hold you back. Get instant answers from our expert mentors through our dedicated doubt resolution platform.",
      icon: <HelpCircle className="w-12 h-12 text-blue-600" />,
      features: ["Quick response time", "One-on-one sessions", "Topic-wise experts", "Video explanations"]
    },
    {
      title: "Performance Analytics",
      description: "Track your learning journey with our advanced analytics dashboard. Monitor progress, identify areas for improvement, and celebrate your achievements.",
      icon: <LineChart className="w-12 h-12 text-blue-600" />,
      features: ["Detailed progress reports", "Personalized insights", "Improvement suggestions", "Achievement tracking"]
    },
    {
      title: "Discussion Forums",
      description: "Join our vibrant community of learners. Share knowledge, discuss concepts, and learn from peers through moderated discussion forums.",
      icon: <MessageCircle className="w-12 h-12 text-blue-600" />,
      features: ["Topic-wise discussions", "Expert moderation", "Peer learning", "Resource sharing"]
    },
    {
      title: "Scheduled Learning",
      description: "Stay on track with personalized learning schedules. Our smart calendar helps you maintain consistent progress towards your goals.",
      icon: <Calendar className="w-12 h-12 text-blue-600" />,
      features: ["Customized timetables", "Reminder system", "Flexible scheduling", "Progress tracking"]
    }
  ];

  const values = [
    {
      title: "Excellence in Education",
      description: "We strive to maintain the highest standards in digital education and learning methodologies.",
      icon: <Award className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Student-Centered Approach",
      description: "Our focus is always on creating the best possible learning experience for our students.",
      icon: <Users className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Global Reach",
      description: "We connect students and educators across borders, fostering a global learning community.",
      icon: <Globe className="w-6 h-6 text-blue-600" />
    }
  ];

  const milestones = [
    { year: "2018", event: "Founded with a vision to transform education" },
    { year: "2019", event: "Launched our first online learning platform" },
    { year: "2020", event: "Expanded to serve 1000+ students" },
    { year: "2021", event: "Introduced advanced learning tools" },
    { year: "2022", event: "Partnered with leading educational institutions" },
    { year: "2023", event: "Reached students across 20+ countries" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Previous sections remain unchanged */}
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About EduMatrix
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to make quality education accessible to everyone through innovative technology and dedicated teaching.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive suite of educational services designed to provide an immersive and effective learning experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8">
              To empower educational institutions with cutting-edge technology solutions that enhance learning experiences and improve educational outcomes. We believe in making quality education accessible, engaging, and effective for everyone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start mb-8 last:mb-0">
                <div className="flex-shrink-0 w-24">
                  <div className="font-bold text-blue-600">{milestone.year}</div>
                </div>
                <div className="flex-grow pl-8 border-l-2 border-blue-100">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    {milestone.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              We're a dedicated team of educators, technologists, and innovators working together to transform education.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Learn More?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get in touch with us to learn how we can help transform your institution
            </p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Contact Us
            </button>
          </div>
        </div>
      </section>

       {/* Footer */}
       <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Solutions</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; 2024 EduMatrix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;