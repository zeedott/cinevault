import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Star, Film, Loader2, AlertCircle } from 'lucide-react';
import { Movie, MovieFormData, MovieGenre, MovieStatus } from '../types';
import { movieApi } from '../services/movieApi';

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: MovieFormData) => Promise<void>;
  initialData?: Movie | null;
}

const GENRES: MovieGenre[] = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Thriller',
  'Romance',
  'Animation',
  'Documentary',
  'Other',
];

const STATUSES: MovieStatus[] = ['Want to Watch', 'Watching', 'Watched'];

export const MovieModal: React.FC<MovieModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    posterUrl: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    genre: 'Sci-Fi',
    director: '',
    rating: 8.0,
    status: 'Want to Watch',
    isFavorite: false,
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        posterUrl: initialData.posterUrl || '',
        description: initialData.description || '',
        releaseYear: initialData.releaseYear || new Date().getFullYear(),
        genre: initialData.genre || 'Sci-Fi',
        director: initialData.director || '',
        rating: initialData.rating ?? 8.0,
        status: initialData.status || 'Want to Watch',
        isFavorite: Boolean(initialData.isFavorite),
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        title: '',
        posterUrl: '',
        description: '',
        releaseYear: new Date().getFullYear(),
        genre: 'Sci-Fi',
        director: '',
        rating: 8.0,
        status: 'Want to Watch',
        isFavorite: false,
        notes: '',
      });
    }
    setErrors({});
    setAutofillSuccess(false);
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Movie title is required.';
    }
    if (!formData.genre) {
      newErrors.genre = 'Genre is required.';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required.';
    }
    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Rating must be between 0 and 10.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Failed to save movie:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutofill = async () => {
    if (!formData.title.trim()) {
      setErrors({ title: 'Enter a movie title first to autofill details.' });
      return;
    }

    setIsAutofilling(true);
    setAutofillSuccess(false);
    try {
      const details = await movieApi.autofillMovieInfo(formData.title.trim());
      setFormData((prev) => ({
        ...prev,
        title: details.title || prev.title,
        posterUrl: details.posterUrl || prev.posterUrl,
        description: details.description || prev.description,
        releaseYear: details.releaseYear || prev.releaseYear,
        genre: (details.genre as MovieGenre) || prev.genre,
        director: details.director || prev.director,
        rating: typeof details.rating === 'number' ? details.rating : prev.rating,
      }));
      setAutofillSuccess(true);
      setErrors({});
    } catch (err) {
      console.error('Autofill error:', err);
    } finally {
      setIsAutofilling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-zinc-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Film className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">
                {initialData ? 'Edit Movie' : 'Add New Movie'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Title & Autofill row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Movie Title <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutofill}
                  disabled={isAutofilling}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1 rounded-lg transition disabled:opacity-50"
                  title="Autofill poster, description, director, genre automatically"
                >
                  {isAutofilling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isAutofilling ? 'Fetching Details...' : 'Autofill Info'}</span>
                </button>
              </div>

              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Inception, Dune, Oppenheimer"
                className={`w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl px-4 py-2.5 border ${
                  errors.title ? 'border-red-500/80 focus:ring-red-500' : 'border-zinc-800 focus:border-red-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500/20 transition`}
              />
              {errors.title && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
              {autofillSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <Sparkles className="w-3.5 h-3.5" /> Movie metadata automatically updated!
                </p>
              )}
            </div>

            {/* Poster URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Poster Image URL
              </label>
              <input
                type="url"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl px-4 py-2.5 border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
              />
            </div>

            {/* Genre & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value as MovieGenre })}
                  className="w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl px-4 py-2.5 border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g} className="bg-zinc-900 text-zinc-100">
                      {g}
                    </option>
                  ))}
                </select>
                {errors.genre && <p className="text-xs text-red-400">{errors.genre}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MovieStatus })}
                  className="w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl px-4 py-2.5 border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-zinc-900 text-zinc-100">
                      {s}
                    </option>
                  ))}
                </select>
                {errors.status && <p className="text-xs text-red-400">{errors.status}</p>}
              </div>
            </div>

            {/* Release Year, Director & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Release Year
                </label>
                <input
                  type="number"
                  min="1888"
                  max={new Date().getFullYear() + 5}
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) || 2024 })}
                  className="w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl px-4 py-2.5 border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Director
                </label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  placeholder="e.g. Christopher Nolan"
                  className="w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl px-4 py-2.5 border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Rating
                  </label>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {formData.rating.toFixed(1)} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full accent-red-500 cursor-pointer mt-3"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Description / Plot Summary
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief plot overview or synopsis..."
                className="w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl p-3 border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
              />
            </div>

            {/* Personal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Personal Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Why you want to watch it, review, or thoughts..."
                className="w-full bg-zinc-950 text-zinc-100 text-sm rounded-xl p-3 border border-zinc-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
              />
            </div>

            {/* Favorite Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isFavorite"
                checked={formData.isFavorite}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-800 text-red-600 focus:ring-red-500 bg-zinc-950 cursor-pointer"
              />
              <label htmlFor="isFavorite" className="text-sm font-medium text-zinc-200 cursor-pointer">
                Mark as Favorite ❤️
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-lg shadow-red-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{initialData ? 'Save Changes' : 'Add Movie'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
