import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Instagram, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="app-footer"
      className="bg-[#050505] border-t border-white/10 mt-auto py-8 text-zinc-400 text-xs relative overflow-hidden"
    >
      {/* Subtle Ambient Red Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        {/* Main Bar: Horizontal on Desktop, Centered Stacked on Mobile */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Logo & One-line Description */}
          <div className="flex flex-col items-center md:items-start gap-1.5 max-w-sm">
            <Link to="/dashboard" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
                CV
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                CineVault
              </span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Your personal private movie vault for tracking and organizing cinema.
            </p>
          </div>

          {/* Essential Navigation Links */}
          <nav className="flex flex-wrap justify-center items-center gap-5 sm:gap-6 text-xs font-medium text-zinc-300">
            <Link to="/dashboard" className="hover:text-white transition-colors duration-200">
              Dashboard
            </Link>
            <Link to="/movies" className="hover:text-white transition-colors duration-200">
              Collection
            </Link>
            <Link to="/watchlist" className="hover:text-white transition-colors duration-200">
              Watchlist
            </Link>
            <Link to="/favorites" className="hover:text-white transition-colors duration-200">
              Favorites
            </Link>
          </nav>

          {/* Simple Social Media Icons */}
          <div className="flex items-center justify-center gap-2.5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cinema Database"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              <Film className="w-4 h-4 text-red-500" />
            </a>
          </div>
        </div>

        {/* Subtle Bottom Line: Copyright & Back to Top */}
        <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} CineVault. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>
    </footer>
  );
};
