import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicPage from './pages/PublicPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blair-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route
        path="/admin/*"
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/staff/*"
        element={user ? <StaffDashboard /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
