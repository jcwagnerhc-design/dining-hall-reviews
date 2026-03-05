import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { getAISummaries } from '../../api';

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function StaffAISummary() {
  const [summaries, setSummaries] = useState([]);
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAISummaries(monthYear)
      .then(setSummaries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [monthYear]);

  const latestSummary = summaries.length > 0 ? summaries[0].summary_json : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500">AI-powered analysis of student recommendations</p>
        </div>
        <input
          type="month"
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : latestSummary ? (
        <div className="space-y-6">
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Brain size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No AI summary available for {monthYear}.</p>
          <p className="text-sm text-gray-400">Summaries are generated by admins or automatically at the end of each month.</p>
        </div>
      )}
    </div>
  );
}
