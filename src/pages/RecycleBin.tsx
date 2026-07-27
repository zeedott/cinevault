import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Info,
  ArrowLeft,
  Sparkles,
  Film,
  Calendar,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '../types';
import { movieApi } from '../services/movieApi';
import { SkeletonGrid } from '../components/SkeletonCard';

interface RecycleBinProps {
  onRefreshStats: () => void;
  showToast: (
    type: 'success' | 'error' | 'info',
    message: string,
    action?: { label: string; onClick: () => void }
  ) => void;
}

export const RecycleBin: React.FC<RecycleBinProps> = ({ onRefreshStats, showToast }) => {
  const [trashMovies, setTrashMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Modals state
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Movie | null>(null);
  const [showEmptyModal, setShowEmptyModal] = useState<boolean>(false);
  const [showRestoreAllModal, setShowRestoreAllModal] = useState<boolean>(false);
  const [isProcessingModal, setIsProcessingModal] = useState<boolean>(false);

  const fetchTrashMovies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await movieApi.getTrashMovies();
      setTrashMovies(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load Recycle Bin', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTrashMovies();
  }, [fetchTrashMovies]);

  // Restore single movie
  const handleRestore = async (movie: Movie) => {
    try {
      setRestoringId(movie._id);
      await movieApi.restoreMovie(movie._id);
      setTrashMovies((prev) => prev.filter((m) => m._id !== movie._id));
      onRefreshStats();
      showToast('success', `Restored "${movie.title}" to your collection ♻️`);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to restore movie');
    } finally {
      setRestoringId(null);
    }
  };

  // Permanent Delete Single Movie
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    try {
      setIsProcessingModal(true);
      await movieApi.permanentDeleteMovie(permanentDeleteTarget._id);
      setTrashMovies((prev) => prev.filter((m) => m._id !== permanentDeleteTarget._id));
      onRefreshStats();
      showToast('info', `Permanently deleted "${permanentDeleteTarget.title}".`);
      setPermanentDeleteTarget(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to permanently delete movie');
    } finally {
      setIsProcessingModal(false);
    }
  };

  // Restore All Movies
  const handleConfirmRestoreAll = async () => {
    try {
      setIsProcessingModal(true);
      const res = await movieApi.restoreAllTrash();
      setTrashMovies([]);
      onRefreshStats();
      showToast('success', res.message || 'All movies restored from Recycle Bin ♻️');
      setShowRestoreAllModal(false);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to restore movies');
    } finally {
      setIsProcessingModal(false);
    }
  };

  // Empty Recycle Bin
  const handleConfirmEmptyTrash = async () => {
    try {
      setIsProcessingModal(true);
      const res = await movieApi.emptyTrash();
      setTrashMovies([]);
      onRefreshStats();
      showToast(res.message || 'Recycle Bin emptied successfully 🗑️', 'info');
      setShowEmptyModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to empty Recycle Bin', 'error');
    } finally {
      setIsProcessingModal(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <span>Recycle Bin</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Soft-deleted movies are stored here. Recover them anytime or permanently remove them.
          </p>
        </div>

        {/* Global Bin Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowRestoreAllModal(true)}
            disabled={trashMovies.length === 0 || loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore All</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmptyModal(true)}
            disabled={trashMovies.length === 0 || loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Recycle Bin</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-amber-300">Safe Deletion:</span> Deleted movies are kept safely in your Recycle Bin. They are excluded from your stats and main collection until recovered. Permanently deleting a movie cannot be undone.
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : trashMovies.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800/60 my-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 mb-4 shadow-xl">
            <Trash2 className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Recycle Bin is Empty</h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            There are no deleted movies in your bin right now. Any movie you delete from your collection will appear here.
          </p>
          <Link
            to="/movies"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition shadow-lg flex items-center gap-2"
          >
            <Film className="w-4 h-4" />
            <span>Browse Collection</span>
          </Link>
        </motion.div>
      ) : (
        /* Movie Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {trashMovies.map((movie) => (
              <motion.div
                key={movie._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800/80 overflow-hidden shadow-xl hover:border-zinc-700 transition-all duration-300"
              >
                {/* Poster & Badges */}
                <div className="relative aspect-[2/3] w-full bg-zinc-950 overflow-hidden">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950">
                      <Film className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">No Poster</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />

                  {/* Status & Rating Pills */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900/90 backdrop-blur-md border border-zinc-700 text-zinc-300 shadow">
                      {movie.genre}
                    </span>

                    {movie.rating > 0 && (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{movie.rating.toFixed(1)}</span>
                      </span>
                    )}
                  </div>

                  {/* Deleted At Banner */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 backdrop-blur-md border border-rose-500/30 text-rose-300 text-[10px] font-medium flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">Deleted: {formatDate(movie.deletedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-4 bg-zinc-900">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {movie.releaseYear} • {movie.director || 'Unknown Director'}
                    </p>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleRestore(movie)}
                      disabled={restoringId === movie._id}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${restoringId === movie._id ? 'animate-spin' : ''}`} />
                      <span>{restoringId === movie._id ? 'Restoring...' : 'Recover'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPermanentDeleteTarget(movie)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal 1: Permanent Delete Single Movie */}
      <AnimatePresence>
        {permanentDeleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Permanent Deletion</h3>
                  <p className="text-xs text-zinc-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 mb-5 flex items-center gap-3">
                {permanentDeleteTarget.posterUrl && (
                  <img
                    src={permanentDeleteTarget.posterUrl}
                    alt={permanentDeleteTarget.title}
                    className="w-10 h-14 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{permanentDeleteTarget.title}</h4>
                  <p className="text-xs text-zinc-400">{permanentDeleteTarget.releaseYear} • {permanentDeleteTarget.genre}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                Are you sure you want to permanently delete <strong className="text-white">"{permanentDeleteTarget.title}"</strong> from CineVault? It will be erased forever.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPermanentDeleteTarget(null)}
                  disabled={isProcessingModal}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPermanentDelete}
                  disabled={isProcessingModal}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isProcessingModal ? 'Erasing...' : 'Delete Permanently'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Empty Recycle Bin Confirmation */}
      <AnimatePresence>
        {showEmptyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Empty Recycle Bin</h3>
                  <p className="text-xs text-zinc-400">Permanent destruction</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                Are you sure you want to permanently delete all <strong className="text-white">{trashMovies.length}</strong> movies in your Recycle Bin? None of these movies can be recovered afterwards.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmptyModal(false)}
                  disabled={isProcessingModal}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEmptyTrash}
                  disabled={isProcessingModal}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isProcessingModal ? 'Emptying...' : 'Empty Bin'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Restore All Movies Confirmation */}
      <AnimatePresence>
        {showRestoreAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Restore All Movies</h3>
                  <p className="text-xs text-zinc-400">Recover soft-deleted items</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                Are you sure you want to restore all <strong className="text-white">{trashMovies.length}</strong> movies back to your active collection?
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRestoreAllModal(false)}
                  disabled={isProcessingModal}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestoreAll}
                  disabled={isProcessingModal}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isProcessingModal ? 'Restoring...' : 'Restore All'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
