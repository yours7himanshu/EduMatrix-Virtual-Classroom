import React from 'react';
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'John Doe',
    role: 'CEO & Founder',
    image: '/path-to-image.jpg',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
  
];

const TeamSection: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-300 mb-6">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Passionate educators and innovators dedicated to transforming the future of education
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-purple-500/10 to-violet-500/10
                backdrop-blur-sm border border-purple-500/10 p-8 hover:shadow-2xl
                transition-all duration-300 hover:scale-105"
              >
                {/* Member content */}
                <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto mb-6 overflow-hidden rounded-full 
                    border-4 border-purple-500/30 group-hover:border-purple-500 transition-colors">
                    <img src="/images/myImage.jpeg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Himanshu Dinkar</h3>
                  <p className="text-purple-400 mb-4">{member.role}</p>
                  {/* Add social links */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;