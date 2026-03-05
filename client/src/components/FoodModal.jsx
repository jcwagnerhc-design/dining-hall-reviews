import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { getFoodItemDetail, submitRating, checkRating } from '../api';

function getDeviceFingerprint() {
  let fp = localStorage.getItem('device_fp');
  if (!fp) {
    fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('device_fp', fp);
  }
  return fp;
}

export default function FoodModal({ item, onClose, onRatingSubmitted }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    Promise.all([
      getFoodItemDetail(item.id),
      checkRating(item.id),
    ])
      .then(([detailData, ratingCheck]) => {
        setDetail(detailData);
        if (ratingCheck.hasRated) {
          setHasRated(true);
          setUserRating(ratingCheck.rating);
        }
        // Also check localStorage
        const localKey = `rated_${item.id}_${getCurrentMonthYear()}`;
        if (localStorage.getItem(localKey)) {
          setHasRated(true);
          setUserRating(Number(localStorage.getItem(localKey)));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [item.id]);

  function getCurrentMonthYear() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const handleRate = async (rating) => {
    if (hasRated) return;
    setRatingError('');

    try {
      await submitRating(item.id, rating, getDeviceFingerprint());
      setUserRating(rating);
      setHasRated(true);
      setRatingSuccess(true);
      // Store in localStorage for duplicate prevention
      const localKey = `rated_${item.id}_${getCurrentMonthYear()}`;
      localStorage.setItem(localKey, String(rating));
      // Refresh parent
      onRatingSubmitted?.();
      // Refresh detail
      const updated = await getFoodItemDetail(item.id);
      setDetail(updated);
    } catch (err) {
      setRatingError(err.message);
    }
  };

  const handleReviewSubmitted = async () => {
    const updated = await getFoodItemDetail(item.id);
    setDetail(updated);
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blair-navy border-t-transparent mx-auto" />
          </div>
        ) : detail ? (
          <>
            {/* Header image */}
            <div className="relative">
              <img
                src={detail.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&auto=format'}
                alt={detail.name}
                className="w-full h-48 md:h-64 object-cover rounded-t-2xl"
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors shadow-md"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>

            <div className="p-5 md:p-6">
              {/* Item info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{detail.name}</h2>
              {detail.description && (
                <p className="text-gray-600 text-sm mb-3">{detail.description}</p>
              )}

              <div className="flex items-center gap-3 mb-5">
                <StarRating rating={detail.avg_rating} size={22} readonly />
                <span className="text-lg font-semibold text-gray-700">
                  {detail.avg_rating > 0 ? detail.avg_rating.toFixed(1) : 'No ratings yet'}
                </span>
                {detail.rating_count > 0 && (
                  <span className="text-sm text-gray-400">
                    ({detail.rating_count} rating{detail.rating_count !== 1 ? 's' : ''})
                  </span>
                )}
              </div>

              {/* Rating section */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {hasRated ? 'Your Rating' : 'Rate This Item'}
                </h3>
                {hasRated ? (
                  <div className="flex items-center gap-2">
                    <StarRating rating={userRating} size={28} readonly />
                    <span className="text-sm text-green-600 font-medium">
                      {ratingSuccess ? 'Rating submitted!' : `You rated ${userRating} stars`}
                    </span>
                  </div>
                ) : (
                  <div>
                    <StarRating rating={userRating} size={32} onRate={handleRate} />
                    <p className="text-xs text-gray-400 mt-1">Click to rate (half-star increments)</p>
                    {ratingError && (
                      <p className="text-sm text-red-500 mt-1">{ratingError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Review form */}
              <ReviewForm foodItemId={item.id} onReviewSubmitted={handleReviewSubmitted} />

              {/* Reviews list */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Reviews ({detail.reviews?.length || 0})
                </h3>
                {detail.reviews && detail.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {detail.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                          <span className="font-medium text-gray-700">{review.graduation_year}</span>
                          {review.gender && <span>· {review.gender}</span>}
                          <span>· {new Date(review.created_at).toLocaleDateString()}</span>
                          {review.updated_at !== review.created_at && (
                            <span className="italic">(edited)</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No reviews yet. Be the first!</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">Failed to load item details.</div>
        )}
      </div>
    </div>
  );
}
