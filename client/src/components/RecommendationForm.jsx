import { useState } from 'react';
import { Send } from 'lucide-react';
import { submitRecommendation } from '../api';

export default function RecommendationForm() {
  const [cuisine, setCuisine] = useState('');
  const [dish, setDish] = useState('');
  const [cuisineSuccess, setCuisineSuccess] = useState('');
  const [dishSuccess, setDishSuccess] = useState('');
  const [cuisineError, setCuisineError] = useState('');
  const [dishError, setDishError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCuisineSubmit = async (e) => {
    e.preventDefault();
    if (!cuisine.trim()) return;
    setCuisineError('');
    setCuisineSuccess('');
    setSubmitting(true);
    try {
      await submitRecommendation('cuisine', cuisine.trim());
      setCuisineSuccess('Thanks for your recommendation!');
      setCuisine('');
    } catch (err) {
      setCuisineError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!dish.trim()) return;
    setDishError('');
    setDishSuccess('');
    setSubmitting(true);
    try {
      await submitRecommendation('dish', dish.trim());
      setDishSuccess('Thanks for your recommendation!');
      setDish('');
    } catch (err) {
      setDishError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Recommend Something New
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Tell us what cuisines or dishes you'd like to see in the dining hall!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cuisine recommendation */}
        <form onSubmit={handleCuisineSubmit} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Recommend a cuisine
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="e.g., Thai, Ethiopian, Korean..."
              maxLength={200}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blair-navy focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !cuisine.trim()}
              className="bg-blair-navy text-white px-3 py-2 rounded-lg hover:bg-blair-navy-light transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          {cuisineSuccess && <p className="text-xs text-green-600">{cuisineSuccess}</p>}
          {cuisineError && <p className="text-xs text-red-500">{cuisineError}</p>}
        </form>

        {/* Dish recommendation */}
        <form onSubmit={handleDishSubmit} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Recommend a specific dish
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={dish}
              onChange={(e) => setDish(e.target.value)}
              placeholder="e.g., Sushi Rolls, Chicken Shawarma..."
              maxLength={200}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blair-navy focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !dish.trim()}
              className="bg-blair-navy text-white px-3 py-2 rounded-lg hover:bg-blair-navy-light transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          {dishSuccess && <p className="text-xs text-green-600">{dishSuccess}</p>}
          {dishError && <p className="text-xs text-red-500">{dishError}</p>}
        </form>
      </div>
    </div>
  );
}
