import { useState } from 'react';
import { Send } from 'lucide-react';
import { submitReview } from '../api';

const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029', 'Faculty/Staff'];
const GENDER_OPTIONS = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function ReviewForm({ foodItemId, onReviewSubmitted }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [gender, setGender] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.toLowerCase().endsWith('@blair.edu')) {
      setError('Please use a valid @blair.edu email address.');
      return;
    }

    if (!gradYear) {
      setError('Please select your graduation year.');
      return;
    }

    if (!reviewText.trim()) {
      setError('Please write a review.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReview({
        food_item_id: foodItemId,
        email,
        graduation_year: gradYear,
        gender: gender || undefined,
        review_text: reviewText,
      });

      setSuccess(result.updated ? 'Review updated!' : 'Review submitted!');
      if (!result.updated) {
        setReviewText('');
      }
      onReviewSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-sm text-blair-navy font-medium hover:underline"
      >
        Write a review...
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Write a Review</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@blair.edu"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blair-navy focus:border-transparent outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Graduation Year <span className="text-red-400">*</span>
          </label>
          <select
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blair-navy focus:border-transparent outline-none bg-white"
            required
          >
            <option value="">Select...</option>
            {GRAD_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Gender <span className="text-gray-400">(optional)</span>
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blair-navy focus:border-transparent outline-none bg-white"
        >
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>{g || 'Prefer not to say'}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts about this dish..."
          rows={3}
          maxLength={2000}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blair-navy focus:border-transparent outline-none resize-none"
          required
        />
        <p className="text-xs text-gray-400 text-right">{reviewText.length}/2000</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blair-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blair-navy-light transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send size={14} />
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
