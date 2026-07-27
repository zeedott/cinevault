import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MovieCard } from './MovieCard';
import { Movie } from '../types';

interface MovieGridProps {
  movies: Movie[];
  onEdit: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      <AnimatePresence mode="popLayout">
        {movies.map((movie) => (
          <MovieCard
            key={movie._id}
            movie={movie}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
