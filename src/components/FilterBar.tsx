import React from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

const GENRES = [
  'All',
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

const STATUSES = [
  { value: 'All', label: 'All Status' },
  { value: 'Want to Watch', label: 'Want to Watch' },
  { value: 'Watching', label: 'Watching' },
  { value: 'Watched', label: 'Watched' },
];

const RATINGS = [
  { value: 0, label: 'All Ratings' },
  { value: 9, label: '⭐ 9.0+' },
  { value: 8, label: '⭐ 8.0+' },
  { value: 7, label: '⭐ 7.0+' },
];

const SORT_OPTIONS = [
  { value: 'recentlyAdded', label: 'Recently Added' },
  { value: 'titleAsc', label: 'Title: A-Z' },
  { value: 'highestRated', label: 'Highest Rated' },
  { value: 'newest', label: 'Release: Newest' },
  { value: 'oldest', label: 'Release: Oldest' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const isFiltered =
    filters.genre !== 'All' ||
    filters.status !== 'All' ||
    filters.minRating > 0 ||
    filters.search !== '' ||
    filters.sortBy !== 'recentlyAdded';

  const handleReset = () => {
    onChange({
      search: '',
      genre: 'All',
      status: 'All',
      minRating: 0,
      sortBy: 'recentlyAdded',
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5 mb-6 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="w-4 h-4 text-red-500" />
          <span>Filters & Sort</span>
          <span className="text-xs font-medium text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md ml-1">
            {totalResults} {totalResults === 1 ? 'movie' : 'movies'}
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full bg-[#0A0A0A] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:border-red-600 focus:outline-none transition cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0A0A0A]">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Genre */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Genre
          </label>
          <select
            value={filters.genre}
            onChange={(e) => onChange({ ...filters, genre: e.target.value })}
            className="w-full bg-[#0A0A0A] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:border-red-600 focus:outline-none transition cursor-pointer"
          >
            {GENRES.map((g) => (
              <option key={g} value={g} className="bg-[#0A0A0A]">
                {g === 'All' ? 'All Genres' : g}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Rating
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ ...filters, minRating: Number(e.target.value) })}
            className="w-full bg-[#0A0A0A] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:border-red-600 focus:outline-none transition cursor-pointer"
          >
            {RATINGS.map((r) => (
              <option key={r.value} value={r.value} className="bg-[#0A0A0A]">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-2.5 h-2.5 text-red-500" />
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
            }
            className="w-full bg-[#0A0A0A] text-white text-xs rounded-xl px-3 py-2 border border-white/10 focus:border-red-600 focus:outline-none transition cursor-pointer font-medium"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0A0A0A]">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
