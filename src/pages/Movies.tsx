import React from 'react';
import { Film, Plus } from 'lucide-react';
import { Movie, FilterState } from '../types';
import { MovieGrid } from '../components/MovieGrid';
import { FilterBar } from '../components/FilterBar';
import { SearchBar } from '../components/SearchBar';
import { SkeletonGrid } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';

interface MoviesPageProps {
  movies: Movie[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  loading: boolean;
  onEditMovie: (movie: Movie) => void;
  onDeleteMovie: (movie: Movie) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  movies,
  filters,
  onFilterChange,
  loading,
  onEditMovie,
  onDeleteMovie,
  onToggleFavorite,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Film className="w-7 h-7 text-red-500" />
            <span>My Movie Vault</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse, search, and manage your complete cinema collection.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/25 transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Movie</span>
        </button>
      </div>

      {/* Standalone Search Bar for mobile or explicit focus */}
      <div className="sm:hidden">
        <SearchBar
          value={filters.search}
          onChange={(q) => onFilterChange({ ...filters, search: q })}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={onFilterChange}
        totalResults={movies.length}
      />

      {/* Movies Grid / Loading / Empty */}
      {loading ? (
        <SkeletonGrid count={10} />
      ) : movies.length > 0 ? (
        <MovieGrid
          movies={movies}
          onEdit={onEditMovie}
          onDelete={onDeleteMovie}
          onToggleFavorite={onToggleFavorite}
        />
      ) : filters.search || filters.genre !== 'All' || filters.status !== 'All' || filters.minRating > 0 ? (
        <EmptyState
          type="search"
          searchQuery={filters.search}
          onAction={() =>
            onFilterChange({
              search: '',
              genre: 'All',
              status: 'All',
              minRating: 0,
              sortBy: 'recentlyAdded',
            })
          }
        />
      ) : (
        <EmptyState type="general" onAction={onOpenAddModal} />
      )}
    </div>
  );
};
