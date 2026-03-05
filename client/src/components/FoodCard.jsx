import StarRating from './StarRating';

export default function FoodCard({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item)}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden text-left group border border-gray-100"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight mb-1.5 line-clamp-2">
          {item.name}
        </h3>
        <div className="flex items-center gap-2">
          <StarRating rating={item.avg_rating} size={16} readonly />
          <span className="text-sm text-gray-500">
            {item.avg_rating > 0 ? item.avg_rating.toFixed(1) : '—'}
          </span>
          {item.rating_count > 0 && (
            <span className="text-xs text-gray-400">
              ({item.rating_count})
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
