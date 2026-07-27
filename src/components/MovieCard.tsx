import React from 'react';
import { Star, Heart, Edit3, Trash2, Eye, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onEdit: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const getStatusBadge = (status: Movie['status']) => {
    switch (status) {
      case 'Watched':
        return {
          icon: CheckCircle2,
          label: 'Watched',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'Watching':
        return {
          icon: PlayCircle,
          label: 'Watching',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'Want to Watch':
      default:
        return {
          icon: Clock,
          label: 'Watchlist',
          className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  const statusBadge = getStatusBadge(movie.status);
  const StatusIcon = statusBadge.icon;

  const defaultPoster =
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden aspect-[2/3] transition-all flex flex-col justify-between shadow-lg"
    >
      {/* Background Poster Image */}
      <img
        src={movie.posterUrl || defaultPoster}
        alt={movie.title}
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultPoster;
        }}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Top Favorite Toggle */}
      <div className="relative z-10 p-3 flex items-center justify-between">
        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {movie.rating ? movie.rating.toFixed(1) : 'NR'}
        </span>

        <button
          type="button"
          onClick={(e) => onToggleFavorite(movie._id, e)}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition shadow-md"
          title={movie.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition ${
              movie.isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Hover Overlay Actions */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-4 z-20">
        <Link
          to={`/movies/${movie._id}`}
          className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg text-center hover:bg-gray-200 transition-colors"
        >
          View Details
        </Link>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={() => onEdit(movie)}
            className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(movie)}
            className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 text-xs font-bold rounded-lg border border-red-600/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="relative z-10 p-4 pt-10">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-0.5 truncate">
          {movie.genre || 'Film'}
        </p>
        <h4 className="text-sm font-bold text-white truncate leading-tight">
          {movie.title}
        </h4>
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-400">
          <span>{movie.releaseYear || 'N/A'} • {movie.rating ? `${movie.rating.toFixed(1)} ★` : 'NR'}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
