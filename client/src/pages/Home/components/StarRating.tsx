
import React from "react";
import { Star } from "@mui/icons-material";
export const StarRating = () => (
    <div className="flex items-center gap-0.5 mb-2">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="text-yellow-400" style={{ fontSize: 15 }} />
      ))}
    </div>
  );