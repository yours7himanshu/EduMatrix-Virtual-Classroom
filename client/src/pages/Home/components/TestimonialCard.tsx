// TestimonialCard.tsx
import React from "react";
import { StarRating } from "./StarRating";
import { motion } from "framer-motion" // You'll need to install framer-motion

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

export const TestimonialCard = ({ 
  quote, 
  author, 
  role = "Student", 
  avatarUrl 
}: TestimonialCardProps) => (
  <motion.div
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-xl
               border border-slate-700/50 backdrop-blur-sm
               hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300"
  >
    <div className="flex items-center gap-4 mb-6">
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={author} 
          className="w-12 h-12 rounded-full border-2 border-blue-500"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {author.charAt(0)}
          </span>
        </div>
      )}
      <div>
        <h3 className="text-gray-100 font-semibold text-lg">{author}</h3>
        <p className="text-blue-400 text-sm">{role}</p>
      </div>
    </div>

    <StarRating />
    
    <div className="mt-6 relative">
      <svg
        className="absolute top-0 left-0 w-8 h-8 text-blue-500/20 transform -translate-x-6 -translate-y-6"
        fill="currentColor"
        viewBox="0 0 32 32"
      >
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
      </svg>
      <p className="text-gray-300  leading-relaxed italic relative z-10">
        "{quote}"
      </p>
    </div>
  </motion.div>
);
