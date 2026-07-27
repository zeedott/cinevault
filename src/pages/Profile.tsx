import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Camera,
  Trash2,
  RefreshCw,
  Edit3,
  Check,
  X,
  Film,
  CheckCircle2,
  Star,
  Clock,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { movieApi } from '../services/movieApi';
import { StatsSummary } from '../types';

interface ProfileProps {
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ addToast }) => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<StatsSummary | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setProfilePhoto(user.profilePhoto || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const s = await movieApi.getStats();
        setStats(s);
      } catch (err) {
        console.error('Failed to load user stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setError('Profile photo must be an image (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('Profile photo file size must be less than 5 MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfilePhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(name.trim(), profilePhoto);
      setIsEditing(false);
      if (addToast) {
        addToast('success', 'Profile updated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setProfilePhoto(user?.profilePhoto || '');
    setError('');
    setIsEditing(false);
  };

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  const createdDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member since 2026';

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/80 via-[#0A0A0A] to-[#0A0A0A] border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
          {/* Avatar Area */}
          <div className="relative group shrink-0">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={user?.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-red-600/80 shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-600 to-red-950 border-4 border-white/20 flex items-center justify-center font-black text-4xl sm:text-5xl text-white shadow-2xl">
                {firstLetter}
              </div>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-transform active:scale-95 shadow-lg"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-widest text-red-500 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified CineVault Member</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight truncate">
              {user?.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Joined {createdDate}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-red-500" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Edit Form when editing mode active */}
      {isEditing && (
        <div className="bg-[#0A0A0A] border border-red-600/30 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Edit3 className="w-5 h-5 text-red-500" />
            Edit Profile Details
          </h2>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Primary account email cannot be changed.
              </span>
            </div>
          </div>

          {/* Profile Photo Uploader Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Profile Photo
            </label>
            <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-red-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-950 border border-white/20 flex items-center justify-center font-bold text-xl text-white">
                  {firstLetter}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3.5 py-2 bg-white/5 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-gray-400">
                  Supported formats: JPG, PNG, WEBP (Max size: 5 MB)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Collection Overview & Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-600/10 text-red-500 rounded-xl">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Total Collection
            </p>
            <p className="text-2xl font-black text-white mt-0.5">
              {stats?.totalMovies ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Watched Movies
            </p>
            <p className="text-2xl font-black text-white mt-0.5">
              {stats?.watchedCount ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Favorite Films
            </p>
            <p className="text-2xl font-black text-white mt-0.5">
              {stats?.favoritesCount ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Avg User Rating
            </p>
            <p className="text-2xl font-black text-white mt-0.5">
              {stats?.averageRating ? `${stats.averageRating} / 10` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Appearance & Theme Settings Section */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Appearance & Theme Mode
        </h3>
        <p className="text-xs text-gray-500">
          Customize CineVault's visual theme. Choose between dark cinematic mode and clean high-contrast light mode.
        </p>
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-900 border-red-500/80 shadow-lg shadow-red-600/10 text-white'
                : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dark Mode</p>
                <p className="text-[11px] text-gray-400">Cinematic dark canvas (Default)</p>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-5 h-5 text-red-500" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              theme === 'light'
                ? 'bg-zinc-900 border-red-500/80 shadow-lg shadow-red-600/10 text-white'
                : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Light Mode</p>
                <p className="text-[11px] text-gray-400">Clean, crisp high-contrast layout</p>
              </div>
            </div>
            {theme === 'light' && <Check className="w-5 h-5 text-red-500" />}
          </button>
        </div>
      </div>

      {/* Account Controls Section */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Account Preferences
        </h3>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <div>
            <p className="text-sm font-semibold text-white">Active Session</p>
            <p className="text-xs text-gray-500 mt-0.5">
              You are currently authenticated as {user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/30 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
