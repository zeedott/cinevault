import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, User as UserIcon, LogIn, UserPlus, LogOut, ChevronDown, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
}) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header id="app-navbar" className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform duration-200">
            CV
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            CineVault
          </span>
        </Link>

        {/* Search Bar */}
        {isAuthenticated && (
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md relative mx-2 hidden sm:block"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies, directors, genres..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-gray-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-xs text-gray-400 hover:text-white bg-white/10 rounded-full px-2 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        )}

        {/* Right Section: Add Movie CTA, Theme Toggle & Profile / Auth */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {isAuthenticated && (
            <button
              id="add-movie-nav-btn"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Movie</span>
            </button>
          )}

          {isAuthenticated && <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />}

          {/* Profile User Icon or Auth Action Buttons */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition cursor-pointer text-left active:scale-95"
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-red-600/50"
                  />
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-tr from-red-600 to-red-900 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-inner uppercase">
                    {firstLetter}
                  </div>
                )}
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-red-600/50"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-red-950 border border-white/20 rounded-full flex items-center justify-center font-extrabold text-sm text-white">
                        {firstLetter}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2.5 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span>View Profile</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2.5 font-medium"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-600/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
