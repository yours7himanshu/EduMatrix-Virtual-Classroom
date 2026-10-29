import { Star } from "lucide-react";
export const StarRating = () => (
    <div className="flex items-center gap-0.5 mb-2" role="img" aria-label="Rated 5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
      ))}
    </div>
  );
