import React from 'react';
import { Film, Bookmark, CheckCircle2, Heart, ArrowRight, Play, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Movie, StatsSummary } from '../types';
import { StatsCard } from '../components/StatsCard';
import { MovieGrid } from '../components/MovieGrid';
import { SkeletonGrid } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';

interface DashboardProps {
  movies: Movie[];
  stats: StatsSummary | null;
  loading: boolean;
  onEditMovie: (movie: Movie) => void;
  onDeleteMovie: (movie: Movie) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  movies,
  stats,
  loading,
  onEditMovie,
  onDeleteMovie,
  onToggleFavorite,
  onOpenAddModal,
}) => {
  // Extract featured movie (e.g. top rated or first watchlist movie)
  const watchlistMovies = movies.filter((m) => m.status === 'Want to Watch');
  const featuredMovie =
    watchlistMovies[0] ||
    movies.find((m) => m.isFavorite) ||
    movies[0];

  const recentlyAdded = [...movies]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const watchlistPreview = watchlistMovies.slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your movie collection and discover what to watch next.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start md:self-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Featured Movie Spotlight Hero */}
      {featuredMovie && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-black group min-h-[220px]"
        >
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredMovie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80'}
              alt={featuredMovie.title}
              className="w-full h-full object-cover mix-blend-screen opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-black to-black/20" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-center h-full max-w-2xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-2 flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-red-500" />
              Featured Today
            </h2>

            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              {featuredMovie.title}
            </h1>

            <p className="text-gray-400 text-xs sm:text-sm max-w-md mb-4 line-clamp-2">
              {featuredMovie.description || `${featuredMovie.releaseYear || 2024} • ${featuredMovie.genre} • Rating: ${featuredMovie.rating?.toFixed(1) || '8.5'} ★`}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/movies/${featuredMovie._id}`}
                className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>View Details</span>
              </Link>
              <Link
                to="/watchlist"
                className="px-6 py-2.5 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors border border-white/10 inline-flex items-center gap-2"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>View Watchlist</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatsCard
          title="Total Movies"
          value={stats?.totalMovies ?? 0}
          description="In personal vault"
          icon={Film}
          colorTheme="red"
          linkTo="/movies"
        />
        <StatsCard
          title="Watchlist"
          value={stats?.watchlistCount ?? 0}
          description="Want to watch"
          icon={Bookmark}
          colorTheme="indigo"
          linkTo="/watchlist"
        />
        <StatsCard
          title="Watched"
          value={stats?.watchedCount ?? 0}
          description="Completed movies"
          icon={CheckCircle2}
          colorTheme="emerald"
          linkTo="/watched"
        />
        <StatsCard
          title="Favorites"
          value={stats?.favoritesCount ?? 0}
          description="Top tier picks"
          icon={Heart}
          colorTheme="rose"
          linkTo="/favorites"
        />
        <StatsCard
          title="Recycle Bin"
          value={stats?.trashCount ?? 0}
          description="Deleted movies"
          icon={Trash2}
          colorTheme="amber"
          linkTo="/recycle-bin"
        />
      </div>

      {/* Watchlist Preview Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-red-600 rounded-full"></span>
            Watchlist Preview
          </h3>
          <Link
            to="/watchlist"
            className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
          >
            <span>View Watchlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={5} />
        ) : watchlistPreview.length > 0 ? (
          <MovieGrid
            movies={watchlistPreview}
            onEdit={onEditMovie}
            onDelete={onDeleteMovie}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <EmptyState type="watchlist" onAction={onOpenAddModal} />
        )}
      </section>

      {/* Recently Added Movies Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-red-600 rounded-full"></span>
            Recently Added
          </h3>
          <Link
            to="/movies"
            className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
          >
            <span>View all movies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={5} />
        ) : recentlyAdded.length > 0 ? (
          <MovieGrid
            movies={recentlyAdded}
            onEdit={onEditMovie}
            onDelete={onDeleteMovie}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <EmptyState type="general" onAction={onOpenAddModal} />
        )}
      </section>
    </div>
  );
};
