import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, Lightbulb,
  Star, History, Brain, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Overview from './admin/Overview';
import FoodManager from './admin/FoodManager';
import SuggestionManager from './admin/SuggestionManager';
import RatingsData from './admin/RatingsData';
import HistoricalData from './admin/HistoricalData';
import AISummaryPanel from './admin/AISummaryPanel';
import AccountManager from './admin/AccountManager';

const NAV_ITEMS = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { path: '/admin/food', label: 'Manage Items', icon: UtensilsCrossed },
  { path: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
  { path: '/admin/ratings', label: 'Ratings & Reviews', icon: Star },
  { path: '/admin/history', label: 'Historical Data', icon: History },
  { path: '/admin/ai', label: 'AI Insights', icon: Brain },
  { path: '/admin/accounts', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-blair-navy text-white flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-sm text-gray-300">{user?.username}</p>
            </div>
            <button className="lg:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors mb-1"
          >
            View Public Site
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <h1 className="font-bold text-gray-900">Admin Panel</h1>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="food" element={<FoodManager />} />
            <Route path="suggestions" element={<SuggestionManager />} />
            <Route path="ratings" element={<RatingsData />} />
            <Route path="history" element={<HistoricalData />} />
            <Route path="ai" element={<AISummaryPanel />} />
            <Route path="accounts" element={<AccountManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
