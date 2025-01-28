// TestimonialCard.tsx
import React from "react";
import { StarRating } from "./StarRating";
interface TestimonialCardProps {
    quote: string;
    author: string;
  }
  
  export const TestimonialCard = ({ quote, author }: TestimonialCardProps) => (
    <div
      data-aos="fade-up"
      data-aos-duration="1000"
      className="bg-slate-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105"
    >
      <StarRating />
      <p className="text-gray-400 mb-4">{quote}</p>
      <p className="text-gray-200 font-semibold">- {author}</p>
    </div>
  );
  