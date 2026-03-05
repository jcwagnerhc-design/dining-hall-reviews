import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getHistoryMonths, getHistoryTrends, getAdminRatings } from '../../api';

const TAB_CATEGORIES = [
  { key: '', label: 'All Tabs' },
  { key: 'hot_mains', label: 'Hot Mains' },
  { key: 'global_flavors', label: 'Global Flavors' },
  { key: 'desserts', label: 'Desserts' },
];

const COLORS = ['#1e3a5f', '#c9a94e', '#22c55e', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

export default function HistoricalData() {
  const [months, setMonths] = useState([]);
  const [trends, setTrends] = useState([]);
  const [tabFilter, setTabFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistoryMonths().then(setMonths).catch(console.error);
    loadTrends();
  }, []);

  const loadTrends = (tab) => {
    setLoading(true);
    const params = {};
    if (tab || tabFilter) params.tab_category = tab || tabFilter;
    getHistoryTrends(params)
      .then(setTrends)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTrends(); }, [tabFilter]);

  useEffect(() => {
    if (selectedMonth) {
      const params = { month_year: selectedMonth };
      if (tabFilter) params.tab_category = tabFilter;
      getAdminRatings(params).then(setMonthData).catch(console.error);
    } else {
      setMonthData(null);
    }
  }, [selectedMonth, tabFilter]);

  // Transform trends data for chart: { month_year, item1_avg, item2_avg, ... }
  const itemNames = [...new Set(trends.map((t) => t.name))];
  const monthsInData = [...new Set(trends.map((t) => t.month_year))].sort();

  const chartData = monthsInData.map((m) => {
    const point = { month: m };
    for (const name of itemNames) {
      const entry = trends.find((t) => t.month_year === m && t.name === name);
      if (entry) point[name] = Math.round(entry.average * 10) / 10;
    }
    return point;
  });

  // For bar chart: average across all items per month
  const barData = monthsInData.map((m) => {
    const monthTrends = trends.filter((t) => t.month_year === m);
    const avg = monthTrends.length > 0
      ? monthTrends.reduce((s, t) => s + t.average, 0) / monthTrends.length
      : 0;
    const totalRatings = monthTrends.reduce((s, t) => s + t.count, 0);
    return { month: m, average: Math.round(avg * 10) / 10, totalRatings };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Historical Data</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={tabFilter}
          onChange={(e) => setTabFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          {TAB_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="">Select month for detail view...</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 animate-pulse">
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall trend bar chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Average Rating by Month</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">No historical data available yet.</p>
            )}
          </div>

          {/* Per-item trend line chart */}
          {chartData.length > 0 && itemNames.length <= 12 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Rating Trends by Item</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {itemNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Selected month detail */}
          {selectedMonth && monthData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Detail: {selectedMonth}</h3>
              <p className="text-sm text-gray-500 mb-3">{monthData.raw.length} total ratings</p>
              <div className="space-y-2">
                {monthData.summary
                  .sort((a, b) => b.average - a.average)
                  .map((item) => (
                    <div key={item.food_item_id} className="flex items-center gap-3 py-1">
                      <span className="text-sm font-medium text-gray-700 w-48 truncate">{item.name}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-blair-navy h-full rounded-full"
                          style={{ width: `${(item.average / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {item.average.toFixed(1)} ({item.count})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
