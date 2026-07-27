import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Heart,
  Edit3,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '../types';
import { movieApi } from '../services/movieApi';

interface MovieDetailsProps {
  onEditMovie: (movie: Movie) => void;
  onDeleteMovie: (movie: Movie) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const MovieDetailsPage: React.FC<MovieDetailsProps> = ({
  onEditMovie,
  onDeleteMovie,
  onToggleFavorite,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    movieApi
      .getMovieById(id)
      .then((data) => {
        setMovie(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load movie details:', err);
        setError('Could not load movie details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-3" />
        <p className="text-sm font-medium">Loading cinematic details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-sm text-zinc-400 mb-6">
          The requested movie could not be located in your CineVault database.
        </p>
        <button
          onClick={() => navigate('/movies')}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm px-5 py-2.5 rounded-xl transition"
        >
          Back to Movie Vault
        </button>
      </div>
    );
  }

  const defaultPoster =
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';

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
          label: 'Want to Watch',
          className: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  const statusInfo = getStatusBadge(movie.status);
  const StatusIcon = statusInfo.icon;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    await onToggleFavorite(movie._id, e);
    setMovie((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 rounded-xl transition hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Cinematic Hero Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-2xl"
      >
        {/* Background Backdrop Blur */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.posterUrl || defaultPoster}
            alt={movie.title}
            className="w-full h-full object-cover opacity-20 filter blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
        </div>

        {/* Content Banner Container */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start gap-8">
          {/* Poster */}
          <div className="w-48 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/80 shrink-0 bg-zinc-950">
            <img
              src={movie.posterUrl || defaultPoster}
              alt={movie.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultPoster;
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-5">
            {/* Badges & Status */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.className}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </span>

              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{movie.rating ? movie.rating.toFixed(1) : 'NR'} / 10</span>
              </div>

              {movie.isFavorite && (
                <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  Favorite
                </span>
              )}
            </div>

            {/* Title & Year */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-red-500" />
                  {movie.releaseYear || 'N/A'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-red-500" />
                  {movie.genre}
                </span>
                {movie.director && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-red-500" />
                      Dir: {movie.director}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onEditMovie(movie)}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Movie</span>
              </button>

              <button
                onClick={handleFavoriteClick}
                className={`font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                  movie.isFavorite
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-zinc-800/90 text-zinc-200 border-zinc-700/80 hover:bg-zinc-700/90'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    movie.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                  }`}
                />
                <span>{movie.isFavorite ? 'In Favorites' : 'Add to Favorites'}</span>
              </button>

              <button
                onClick={() => {
                  onDeleteMovie(movie);
                  navigate('/movies');
                }}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Movie</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Sections: Description & Personal Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Description */}
        <div className="md:col-span-2 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-3">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <FileText className="w-4 h-4 text-red-500" />
            Plot Overview & Synopsis
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {movie.description || 'No description provided for this movie.'}
          </p>
        </div>

        {/* Personal Notes */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-3">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <Star className="w-4 h-4 text-amber-400" />
            Personal Notes & Review
          </h3>
          <p className="text-sm text-zinc-300 italic leading-relaxed whitespace-pre-line">
            {movie.notes ? `"${movie.notes}"` : 'No personal review notes logged yet.'}
          </p>
        </div>
      </div>
    </div>
  );
};
