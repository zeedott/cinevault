import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Movie } from '../types';

interface DeleteModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  movie,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !movie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
        >
          {/* Header Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Move to Recycle Bin</h3>
              <p className="text-xs text-zinc-400">Confirmation required</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Movie Summary Box */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 mb-5">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-12 h-16 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-12 h-16 bg-zinc-800 rounded-lg shrink-0 flex items-center justify-center text-zinc-500 text-xs font-bold">
                No Poster
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-zinc-100 truncate">{movie.title}</h4>
              <p className="text-xs text-zinc-400">
                {movie.releaseYear} • {movie.genre}
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-300 mb-6">
            Are you sure you want to move <span className="font-semibold text-white">"{movie.title}"</span> to the Recycle Bin? You can recover it anytime later from the Recycle Bin.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Moving...' : 'Move to Bin'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
