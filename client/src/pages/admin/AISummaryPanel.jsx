import { useState, useEffect } from 'react';
import { Brain, Play, RefreshCw } from 'lucide-react';
import { getAISummaries, runAISummarizer, getAdminRecommendations } from '../../api';

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function AISummaryPanel() {
  const [summaries, setSummaries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sums, recs] = await Promise.all([
        getAISummaries(monthYear),
        getAdminRecommendations(monthYear),
      ]);
      setSummaries(sums);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [monthYear]);

  const handleRun = async () => {
    setRunning(true);
    setError('');
    try {
      await runAISummarizer(monthYear);
      loadData();
    } catch (err) {
      setError(err.message);
    }
    setRunning(false);
  };

  const cuisineRecs = recommendations.filter((r) => r.rec_type === 'cuisine');
  const dishRecs = recommendations.filter((r) => r.rec_type === 'dish');

  const latestSummary = summaries.length > 0 ? summaries[0].summary_json : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500">AI-powered analysis of student recommendations</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
          />
          <button
            onClick={handleRun}
            disabled={running}
            className="bg-blair-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blair-navy-light flex items-center gap-2 disabled:opacity-50"
          >
            {running ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? 'Running...' : 'Run Summarizer'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Latest AI Summary */}
          {latestSummary ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={20} className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">Latest Summary</h3>
                <span className="text-xs text-gray-400 ml-auto">
                  Generated: {new Date(summaries[0].created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-4 bg-purple-50 p-3 rounded-lg">
                {latestSummary.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Cuisines */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Top Requested Cuisines ({latestSummary.total_cuisine_recommendations} total)
                  </h4>
                  {latestSummary.top_cuisines?.length > 0 ? (
                    <div className="space-y-2">
                      {latestSummary.top_cuisines.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-6 text-gray-400">#{i + 1}</span>
                          <span className="text-sm font-medium text-gray-900 flex-1">{c.cuisine}</span>
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{c.count} mentions</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No cuisine recommendations.</p>
                  )}
                </div>

                {/* Top Dishes */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Top Requested Dishes ({latestSummary.total_dish_recommendations} total)
                  </h4>
                  {latestSummary.top_dishes?.length > 0 ? (
                    <div className="space-y-2">
                      {latestSummary.top_dishes.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-6 text-gray-400">#{i + 1}</span>
                          <span className="text-sm font-medium text-gray-900 flex-1">{d.dish}</span>
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">{d.count} mentions</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No dish recommendations.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Brain size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No AI summary generated yet for {monthYear}.</p>
              <p className="text-sm text-gray-400">Click "Run Summarizer" to generate insights from recommendations.</p>
            </div>
          )}

          {/* Raw Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                Raw Cuisine Recommendations ({cuisineRecs.length})
              </h3>
              {cuisineRecs.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {cuisineRecs.map((r) => (
                    <div key={r.id} className="text-sm py-1 px-2 bg-gray-50 rounded flex justify-between">
                      <span className="text-gray-700">{r.text}</span>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">None yet.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                Raw Dish Recommendations ({dishRecs.length})
              </h3>
              {dishRecs.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {dishRecs.map((r) => (
                    <div key={r.id} className="text-sm py-1 px-2 bg-gray-50 rounded flex justify-between">
                      <span className="text-gray-700">{r.text}</span>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">None yet.</p>
              )}
            </div>
          </div>

          {/* Past summaries */}
          {summaries.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Past Summaries</h3>
              <div className="space-y-3">
                {summaries.slice(1).map((s) => (
                  <div key={s.id} className="border-l-2 border-gray-200 pl-3 py-1">
                    <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{s.summary_json.summary}</p>
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
