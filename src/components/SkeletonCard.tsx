import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-lg animate-pulse flex flex-col h-full">
      {/* Poster shimmer */}
      <div className="aspect-[2/3] w-full bg-zinc-800/80" />
      {/* Footer shimmer */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-800 rounded-md w-3/4" />
        <div className="h-3 bg-zinc-800/60 rounded-md w-1/2" />
        <div className="pt-2 flex justify-between">
          <div className="h-5 bg-zinc-800/80 rounded-md w-20" />
          <div className="h-3 bg-zinc-800/60 rounded-md w-12" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
