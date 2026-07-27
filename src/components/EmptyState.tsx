import React from 'react';
import { Film, Plus, Search, Bookmark, Heart, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  type?: 'general' | 'search' | 'watchlist' | 'watched' | 'favorites';
  onAction?: () => void;
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'general',
  onAction,
  searchQuery,
}) => {
  const getDetails = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: searchQuery ? `No results for "${searchQuery}"` : 'No matching movies found',
          description: 'Try adjusting your search terms or filters to find what you are looking for.',
          buttonText: 'Clear Search Filters',
        };
      case 'watchlist':
        return {
          icon: Bookmark,
          title: 'Your Watchlist is Empty',
          description: 'Save movies you want to watch next and build your personal queue.',
          buttonText: 'Browse Movies to Add',
        };
      case 'watched':
        return {
          icon: CheckCircle2,
          title: 'No Watched Movies Yet',
          description: 'Mark movies as watched after viewing to keep track of your cinematic journey.',
          buttonText: 'Add Movie to Collection',
        };
      case 'favorites':
        return {
          icon: Heart,
          title: 'No Favorites Saved',
          description: 'Click the heart icon on any movie card to add it to your hall of fame.',
          buttonText: 'Explore Collection',
        };
      case 'general':
      default:
        return {
          icon: Film,
          title: 'Your movie collection is empty.',
          description: 'Start building your personal movie vault today.',
          buttonText: 'Add Your First Movie',
        };
    }
  };

  const details = getDetails();
  const Icon = details.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 my-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 max-w-lg mx-auto shadow-xl"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-600/10">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-zinc-100 mb-2">{details.title}</h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-sm leading-relaxed">{details.description}</p>

      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{details.buttonText}</span>
        </button>
      )}
    </motion.div>
  );
};
