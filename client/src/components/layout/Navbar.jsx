// src/components/layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Car, Bell, User, LogOut, ChevronDown,
  LayoutDashboard, Menu, X, Heart, Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isOwner) return '/owner';
    return '/dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">RentiGo</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/vehicles" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Browse Vehicles
            </Link>
            {isAuthenticated && (
              <>
                <Link to={getDashboardPath()} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/notifications" className="relative text-zinc-400 hover:text-zinc-100 transition-colors">
                  <Bell className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{user?.name?.[0]}</span>
                    </div>
                  )}
                  <span className="text-sm text-zinc-300">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={clsx('w-4 h-4 text-zinc-400 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl border border-zinc-700 shadow-2xl animate-scale-in">
                    <div className="p-3 border-b border-zinc-700">
                      <p className="text-sm font-semibold text-zinc-100">{user?.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/wishlist" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors">
                        <Heart className="w-4 h-4" /> Wishlist
                      </Link>
                      <Link to={getDashboardPath()} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors">
                        <Settings className="w-4 h-4" /> Dashboard
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-zinc-700">
                      <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 transition-colors rounded-xl hover:bg-zinc-800">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 text-sm text-white rounded-xl gradient-brand hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-xl hover:bg-zinc-800 text-zinc-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-xl animate-slide-up">
          <div className="p-4 space-y-2">
            <Link to="/vehicles" className="block px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
              Browse Vehicles
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} className="block px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/profile" className="block px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2.5 rounded-xl text-sm text-zinc-300 bg-zinc-800">Login</button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2.5 rounded-xl text-sm text-white gradient-brand">Register</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
