import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminLoginModal from './AdminLoginModal';

export default function Layout({ children }) {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blair-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Blair Academy Dining
            </h1>
            <p className="text-blair-gold text-sm font-medium mt-0.5">Food Review</p>
          </div>
          <div>
            {user ? (
              <a
                href={user.role === 'admin' ? '/admin' : '/staff'}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <LogIn size={16} />
                {user.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
              </a>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <LogIn size={16} />
                Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Login modal */}
      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
