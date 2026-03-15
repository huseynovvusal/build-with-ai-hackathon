import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, User, Settings, Shield } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Users className="h-8 w-8 text-accent" />
              <span className="font-bold text-xl tracking-tight">Community Match</span>
            </Link>
            {user && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link to="/dashboard" className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                  <Link to="/members" className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-md text-sm font-medium">View Members</Link>
                  <Link to="/projects/new" className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-md text-sm font-medium">Create Project</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-text-secondary hover:text-text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-border transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary">Log in</Link>
                <Link to="/register" className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
