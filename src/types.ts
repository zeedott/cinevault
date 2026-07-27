export interface User {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type MovieStatus = 'Want to Watch' | 'Watching' | 'Watched';

export type MovieGenre =
  | 'Action'
  | 'Adventure'
  | 'Comedy'
  | 'Drama'
  | 'Horror'
  | 'Sci-Fi'
  | 'Thriller'
  | 'Romance'
  | 'Animation'
  | 'Documentary'
  | 'Other';

export interface Movie {
  _id: string;
  title: string;
  posterUrl: string;
  description: string;
  releaseYear: number;
  genre: MovieGenre;
  director: string;
  rating: number; // 0 - 10
  status: MovieStatus;
  isFavorite: boolean;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MovieFormData = Omit<Movie, '_id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt'>;

export interface FilterState {
  search: string;
  genre: string; // 'All' or specific genre
  status: string; // 'All' or specific status
  minRating: number; // 0, 7, 8, 9
  sortBy: 'recentlyAdded' | 'titleAsc' | 'highestRated' | 'oldest' | 'newest';
}

export interface StatsSummary {
  totalMovies: number;
  watchlistCount: number;
  watchedCount: number;
  watchingCount: number;
  favoritesCount: number;
  trashCount?: number;
  averageRating: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
