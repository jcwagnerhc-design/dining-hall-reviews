import { useState, useEffect } from 'react';
import { getSuggestions } from '../api';
import SuggestionCard from './SuggestionCard';
import RecommendationForm from './RecommendationForm';

export default function SuggestionsTab() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = () => {
    getSuggestions()
      .then(setSuggestions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="flex">
              <div className="w-48 h-32 bg-gray-200" />
              <div className="flex-1 p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900">This Month's Suggestions</h2>
        <p className="text-sm text-gray-500">
          Vote on dining hall ideas from the staff. Your feedback helps shape the menu!
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No suggestions for this month yet.</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} onVoted={loadSuggestions} />
          ))}
        </div>
      )}

      {/* Recommendation forms at bottom */}
      <div className="pt-6 border-t border-gray-200">
        <RecommendationForm />
      </div>
    </div>
  );
}
