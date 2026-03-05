const TABS = [
  { key: 'hot_mains', label: 'Hot Mains' },
  { key: 'global_flavors', label: 'Global Flavors' },
  { key: 'desserts', label: 'Desserts' },
  { key: 'suggestions', label: 'Suggestions' },
];

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <nav className="flex py-2 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all mx-0.5 sm:mx-1 ${
                activeTab === tab.key
                  ? 'bg-blair-navy text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blair-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
