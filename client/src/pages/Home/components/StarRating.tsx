
import React from "react";
import { Star } from "@mui/icons-material";
export const StarRating = () => (
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="text-yellow-400 text-2xl mr-2" />
      ))}
    </div>
  );