import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { Movie, FilterState } from '../types';
import { MovieGrid } from '../components/MovieGrid';
import { FilterBar } from '../components/FilterBar';
import { SkeletonGrid } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';

interface FavoritesPageProps {
  movies: Movie[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  loading: boolean;
  onEditMovie: (movie: Movie) => void;
  onDeleteMovie: (movie: Movie) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  movies,
  filters,
  onFilterChange,
  loading,
  onEditMovie,
  onDeleteMovie,
  onToggleFavorite,
  onOpenAddModal,
}) => {
  const favoriteMovies = movies.filter((m) => m.isFavorite);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>Favorite Movies</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Your top-rated masterpieces and all-time favorite cinema picks.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/25 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Favorite</span>
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={onFilterChange}
        totalResults={favoriteMovies.length}
      />

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : favoriteMovies.length > 0 ? (
        <MovieGrid
          movies={favoriteMovies}
          onEdit={onEditMovie}
          onDelete={onDeleteMovie}
          onToggleFavorite={onToggleFavorite}
        />
      ) : (
        <EmptyState type="favorites" onAction={onOpenAddModal} />
      )}
    </div>
  );
};
