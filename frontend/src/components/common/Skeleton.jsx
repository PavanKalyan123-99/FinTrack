import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-cardBg border border-borderColor rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-cardBg border border-borderColor rounded-2xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
};
