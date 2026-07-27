import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { movieApi } from './services/movieApi';
import { Movie, MovieFormData, StatsSummary, FilterState, ToastMessage } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MovieModal } from './components/MovieModal';
import { DeleteModal } from './components/DeleteModal';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { MoviesPage } from './pages/Movies';
import { WatchlistPage } from './pages/Watchlist';
import { WatchedPage } from './pages/Watched';
import { FavoritesPage } from './pages/Favorites';
import { MovieDetailsPage } from './pages/MovieDetails';
import { RecycleBin } from './pages/RecycleBin';
import { Footer } from './components/Footer';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: 'All',
    status: 'All',
    minRating: 0,
    sortBy: 'recentlyAdded',
  });

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedMovieForEdit, setSelectedMovieForEdit] = useState<Movie | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMovieForDelete, setSelectedMovieForDelete] = useState<Movie | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'info',
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Movies and Stats when authenticated
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [movieList, statsData] = await Promise.all([
        movieApi.getMovies(filters),
        movieApi.getStats(),
      ]);
      setMovies(movieList);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load user movie vault data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Create or Edit Submit
  const handleSaveMovie = async (formData: MovieFormData) => {
    try {
      if (selectedMovieForEdit) {
        await movieApi.updateMovie(selectedMovieForEdit._id, formData);
        addToast('success', `Movie updated successfully ✨`);
      } else {
        await movieApi.createMovie(formData);
        addToast('success', `Movie added successfully 🎬`);
      }
      setIsFormModalOpen(false);
      setSelectedMovieForEdit(null);
      await loadData();
    } catch (err: any) {
      console.error('Error saving movie:', err);
      addToast('error', err.response?.data?.message || 'Failed to save movie.');
      throw err;
    }
  };

  // Handle Delete Confirmation (Soft Delete with Undo Toast)
  const handleConfirmDelete = async () => {
    if (!selectedMovieForDelete) return;

    const targetMovie = selectedMovieForDelete;
    setIsDeleting(true);
    try {
      await movieApi.deleteMovie(targetMovie._id);
      setIsDeleteModalOpen(false);
      setSelectedMovieForDelete(null);
      await loadData();

      addToast(
        'info',
        `Moved "${targetMovie.title}" to Recycle Bin 🗑️`,
        {
          label: 'Undo',
          onClick: async () => {
            try {
              await movieApi.restoreMovie(targetMovie._id);
              await loadData();
              addToast('success', `Restored "${targetMovie.title}" ♻️`);
            } catch (err) {
              addToast('error', 'Failed to undo deletion');
            }
          },
        }
      );
    } catch (err: any) {
      console.error('Error soft deleting movie:', err);
      addToast('error', err.response?.data?.message || 'Failed to move movie to Recycle Bin.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await movieApi.toggleFavorite(id);
      setMovies((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isFavorite: updated.isFavorite } : m))
      );
      if (stats) {
        setStats({
          ...stats,
          favoritesCount: updated.isFavorite
            ? stats.favoritesCount + 1
            : Math.max(0, stats.favoritesCount - 1),
        });
      }
      addToast(
        'success',
        updated.isFavorite ? 'Added to favorites ❤️' : 'Removed from favorites'
      );
    } catch (err) {
      addToast('error', 'Failed to update favorite status.');
    }
  };

  // Open Handlers
  const handleOpenAddModal = () => {
    setSelectedMovieForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (movie: Movie) => {
    setSelectedMovieForEdit(movie);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (movie: Movie) => {
    setSelectedMovieForDelete(movie);
    setIsDeleteModalOpen(true);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        searchQuery={filters.search}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, search: q }))}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar (Only shown when authenticated and not on login/register pages) */}
        {isAuthenticated && !isAuthPage && <Sidebar stats={stats || undefined} />}

        {/* Main Route Content */}
        <main className={`flex-1 min-w-0 ${!isAuthPage ? 'p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8' : ''}`}>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login addToast={addToast} />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register addToast={addToast} />
                </PublicRoute>
              }
            />

            {/* Protected App Routes */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    movies={movies}
                    stats={stats}
                    loading={loading}
                    onEditMovie={handleOpenEditModal}
                    onDeleteMovie={handleOpenDeleteModal}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenAddModal={handleOpenAddModal}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies"
              element={
                <ProtectedRoute>
                  <MoviesPage
                    movies={movies}
                    filters={filters}
                    onFilterChange={setFilters}
                    loading={loading}
                    onEditMovie={handleOpenEditModal}
                    onDeleteMovie={handleOpenDeleteModal}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenAddModal={handleOpenAddModal}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <WatchlistPage
                    movies={movies}
                    filters={filters}
                    onFilterChange={setFilters}
                    loading={loading}
                    onEditMovie={handleOpenEditModal}
                    onDeleteMovie={handleOpenDeleteModal}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenAddModal={handleOpenAddModal}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watched"
              element={
                <ProtectedRoute>
                  <WatchedPage
                    movies={movies}
                    filters={filters}
                    onFilterChange={setFilters}
                    loading={loading}
                    onEditMovie={handleOpenEditModal}
                    onDeleteMovie={handleOpenDeleteModal}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenAddModal={handleOpenAddModal}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage
                    movies={movies}
                    filters={filters}
                    onFilterChange={setFilters}
                    loading={loading}
                    onEditMovie={handleOpenEditModal}
                    onDeleteMovie={handleOpenDeleteModal}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenAddModal={handleOpenAddModal}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies/:id"
              element={
                <ProtectedRoute>
                  <MovieDetailsPage
                    onEditMovie={handleOpenEditModal}
                    onDeleteMovie={handleOpenDeleteModal}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile addToast={addToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recycle-bin"
              element={
                <ProtectedRoute>
                  <RecycleBin onRefreshStats={loadData} showToast={addToast} />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modern Footer */}
      {!isAuthPage && <Footer />}

      {/* Modals & Notifications */}
      {isAuthenticated && (
        <>
          <MovieModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setSelectedMovieForEdit(null);
            }}
            onSubmit={handleSaveMovie}
            initialData={selectedMovieForEdit}
          />

          <DeleteModal
            isOpen={isDeleteModalOpen}
            movie={selectedMovieForDelete}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedMovieForDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
