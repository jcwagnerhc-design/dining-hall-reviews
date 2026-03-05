import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onRate, size = 20, readonly = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (starIndex, isHalf) => {
    if (readonly || !onRate) return;
    const value = isHalf ? starIndex - 0.5 : starIndex;
    onRate(value);
  };

  const handleMouseMove = (e, starIndex) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(isHalf ? starIndex - 0.5 : starIndex);
  };

  return (
    <div
      className={`star-rating inline-flex items-center gap-0.5 ${readonly ? '' : 'cursor-pointer'}`}
      onMouseLeave={() => !readonly && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillPercent =
          displayRating >= starIndex
            ? 100
            : displayRating >= starIndex - 0.5
              ? 50
              : 0;

        return (
          <div
            key={starIndex}
            className="star relative"
            style={{ width: size, height: size }}
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isHalf = x < rect.width / 2;
              handleClick(starIndex, isHalf);
            }}
          >
            {/* Empty star background */}
            <Star
              size={size}
              className="absolute inset-0 text-gray-300"
              strokeWidth={1.5}
            />
            {/* Filled portion */}
            {fillPercent > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  size={size}
                  className="text-amber-400 fill-amber-400"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
