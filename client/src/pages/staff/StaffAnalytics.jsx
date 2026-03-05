import { useState, useEffect } from 'react';
import { getAdminRatings, getDemographics } from '../../api';
import StarRating from '../../components/StarRating';

const TAB_CATEGORIES = [
  { key: '', label: 'All Tabs' },
  { key: 'hot_mains', label: 'Hot Mains' },
  { key: 'global_flavors', label: 'Global Flavors' },
  { key: 'desserts', label: 'Desserts' },
];

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function StaffAnalytics() {
  const [activeSection, setActiveSection] = useState('ratings');
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const [tabFilter, setTabFilter] = useState('');
  const [ratingsData, setRatingsData] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { month_year: monthYear };
    if (tabFilter) params.tab_category = tabFilter;

    if (activeSection === 'ratings') {
      getAdminRatings(params).then(setRatingsData).catch(console.error).finally(() => setLoading(false));
    } else {
      getDemographics(monthYear).then(setDemographics).catch(console.error).finally(() => setLoading(false));
    }
  }, [activeSection, monthYear, tabFilter]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        {/* Only ratings + demographics — no reviews tab */}
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          {['ratings', 'demographics'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveSection(t)}
              className={`px-3 py-1.5 rounded text-sm font-medium capitalize transition-colors ${
                activeSection === t ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          type="month"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
        />

        {activeSection === 'ratings' && (
          <select
            value={tabFilter}
            onChange={(e) => setTabFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            {TAB_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
        </div>
      ) : (
        <>
          {/* Ratings — aggregated only, no individual records */}
          {activeSection === 'ratings' && ratingsData && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{ratingsData.raw.length} total ratings this month</p>
              {ratingsData.summary
                .sort((a, b) => b.average - a.average)
                .map((item) => (
                  <div key={item.food_item_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <StarRating rating={item.average} size={16} readonly />
                        <span className="text-sm font-medium">{item.average.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({item.count} ratings)</span>
                      </div>
                    </div>
                    {/* Distribution bar */}
                    <div className="space-y-1">
                      {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map((val) => {
                        const count = item.distribution[String(val)] || 0;
                        if (count === 0) return null;
                        const pct = item.count > 0 ? (count / item.count) * 100 : 0;
                        return (
                          <div key={val} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-10 text-right">{val}★</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              {ratingsData.summary.length === 0 && (
                <p className="text-gray-400 text-center py-8">No ratings for this period.</p>
              )}
            </div>
          )}

          {/* Demographics — aggregated counts and percentages only */}
          {activeSection === 'demographics' && demographics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">By Graduation Year</h3>
                <p className="text-xs text-gray-400 mb-3">Based on {demographics.total_reviews} reviewers</p>
                {Object.entries(demographics.by_graduation_year).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(demographics.by_graduation_year)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([year, count]) => {
                        const pct = demographics.total_reviews > 0
                          ? Math.round((count / demographics.total_reviews) * 100)
                          : 0;
                        return (
                          <div key={year} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-24">{year}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No data available.</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">By Gender</h3>
                <p className="text-xs text-gray-400 mb-3">From reviewers who provided gender</p>
                {Object.entries(demographics.by_gender).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(demographics.by_gender)
                      .sort(([, a], [, b]) => b - a)
                      .map(([gender, count]) => {
                        const pct = demographics.total_reviews > 0
                          ? Math.round((count / demographics.total_reviews) * 100)
                          : 0;
                        return (
                          <div key={gender} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-32">{gender}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No data available.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
