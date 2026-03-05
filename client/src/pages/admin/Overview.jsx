import { useState, useEffect } from 'react';
import { Star, MessageSquare, UtensilsCrossed, Lightbulb, ThumbsUp } from 'lucide-react';
import { getOverview } from '../../api';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-gray-500">Failed to load overview.</p>;

  const cards = [
    { label: 'Total Star Ratings', value: data.total_ratings, icon: Star, color: 'text-amber-500' },
    { label: 'Written Reviews', value: data.total_reviews, icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Active Food Items', value: data.active_food_items, icon: UtensilsCrossed, color: 'text-green-500' },
    { label: 'Active Suggestions', value: data.active_suggestions, icon: Lightbulb, color: 'text-purple-500' },
    { label: 'Recommendations', value: data.total_recommendations, icon: ThumbsUp, color: 'text-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
      <p className="text-sm text-gray-500 mb-6">Current month: {data.month_year}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <card.icon size={20} className={card.color} />
              <span className="text-sm font-medium text-gray-600">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
