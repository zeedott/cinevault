import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Bookmark,
  CheckCircle2,
  Heart,
  User,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { StatsSummary } from '../types';

interface SidebarProps {
  stats?: StatsSummary;
}

export const Sidebar: React.FC<SidebarProps> = ({ stats }) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      count: undefined,
    },
    {
      label: 'My Movies',
      path: '/movies',
      icon: Film,
      count: stats?.totalMovies,
    },
    {
      label: 'Watchlist',
      path: '/watchlist',
      icon: Bookmark,
      count: stats?.watchlistCount,
      highlight: true,
    },
    {
      label: 'Watched',
      path: '/watched',
      icon: CheckCircle2,
      count: stats?.watchedCount,
    },
    {
      label: 'Favorites',
      path: '/favorites',
      icon: Heart,
      count: stats?.favoritesCount,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      label: 'Recycle Bin',
      path: '/recycle-bin',
      icon: Trash2,
      count: stats?.trashCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: User,
      count: undefined,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside id="app-sidebar" className="hidden lg:flex flex-col w-60 shrink-0 bg-[#0A0A0A] border-r border-white/5 p-4 space-y-6 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto">
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-3">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors group ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-red-500'
                            : 'text-gray-400 group-hover:text-white'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {typeof item.count === 'number' && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold transition ${
                          isActive
                            ? 'bg-red-600/30 text-red-400 border border-red-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Vault Stats Widget */}
        {stats && (
          <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-red-500" />
              <span>Vault Rating</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.averageRating}</span>
              <span className="text-xs text-gray-500 font-medium">/ 10 avg score</span>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.averageRating / 10) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav id="mobile-bottom-nav" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/5 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition ${
                  isActive ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
