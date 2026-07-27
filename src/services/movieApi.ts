import axios from 'axios';
import { Movie, MovieFormData, StatsSummary, FilterState } from '../types';

const API_BASE = '/api';

export const movieApi = {
  // Fetch movies with optional filter parameters
  getMovies: async (filters?: Partial<FilterState>): Promise<Movie[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.genre && filters.genre !== 'All') params.append('genre', filters.genre);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const response = await axios.get<Movie[]>(`${API_BASE}/movies?${params.toString()}`);
    return response.data;
  },

  // Fetch a single movie by ID
  getMovieById: async (id: string): Promise<Movie> => {
    const response = await axios.get<Movie>(`${API_BASE}/movies/${id}`);
    return response.data;
  },

  // Get statistics summary
  getStats: async (): Promise<StatsSummary> => {
    const response = await axios.get<StatsSummary>(`${API_BASE}/stats`);
    return response.data;
  },

  // Create movie
  createMovie: async (movieData: MovieFormData): Promise<Movie> => {
    const response = await axios.post<Movie>(`${API_BASE}/movies`, movieData);
    return response.data;
  },

  // Update movie
  updateMovie: async (id: string, movieData: MovieFormData): Promise<Movie> => {
    const response = await axios.put<Movie>(`${API_BASE}/movies/${id}`, movieData);
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id: string): Promise<Movie> => {
    const response = await axios.patch<Movie>(`${API_BASE}/movies/${id}/favorite`);
    return response.data;
  },

  // Soft Delete movie (move to Recycle Bin)
  deleteMovie: async (id: string): Promise<{ message: string; id: string; movie?: Movie }> => {
    const response = await axios.delete<{ message: string; id: string; movie?: Movie }>(`${API_BASE}/movies/${id}`);
    return response.data;
  },

  // Get movies in Recycle Bin
  getTrashMovies: async (): Promise<Movie[]> => {
    const response = await axios.get<Movie[]>(`${API_BASE}/movies/trash`);
    return response.data;
  },

  // Restore movie from Recycle Bin
  restoreMovie: async (id: string): Promise<Movie> => {
    const response = await axios.patch<Movie>(`${API_BASE}/movies/${id}/restore`);
    return response.data;
  },

  // Permanently delete movie
  permanentDeleteMovie: async (id: string): Promise<{ message: string; id: string }> => {
    const response = await axios.delete<{ message: string; id: string }>(`${API_BASE}/movies/${id}/permanent`);
    return response.data;
  },

  // Restore all movies in Recycle Bin
  restoreAllTrash: async (): Promise<{ message: string; restoredCount: number }> => {
    const response = await axios.patch<{ message: string; restoredCount: number }>(`${API_BASE}/movies/trash/restore-all`);
    return response.data;
  },

  // Empty Recycle Bin
  emptyTrash: async (): Promise<{ message: string; deletedCount: number }> => {
    const response = await axios.delete<{ message: string; deletedCount: number }>(`${API_BASE}/movies/trash/empty`);
    return response.data;
  },

  // AI / TMDB Autofill
  autofillMovieInfo: async (title: string): Promise<Partial<MovieFormData>> => {
    const response = await axios.get<Partial<MovieFormData>>(
      `${API_BASE}/autofill-movie?title=${encodeURIComponent(title)}`
    );
    return response.data;
  },
};
