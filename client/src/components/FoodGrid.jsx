import { useState, useEffect } from 'react';
import { getFoodItems } from '../api';
import FoodCard from './FoodCard';
import FoodModal from './FoodModal';

export default function FoodGrid({ tab }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setLoading(true);
    getFoodItems(tab)
      .then(setItems)
      .catch((err) => console.error('Failed to load items:', err))
      .finally(() => setLoading(false));
  }, [tab]);

  const handleRatingSubmitted = () => {
    // Refresh items to update averages
    getFoodItems(tab).then(setItems).catch(console.error);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No items available for this month yet.</p>
        <p className="text-sm mt-1">Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} onClick={setSelectedItem} />
        ))}
      </div>

      {selectedItem && (
        <FoodModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </>
  );
}
