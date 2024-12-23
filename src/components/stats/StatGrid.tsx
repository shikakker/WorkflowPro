import React from 'react';
import { StatCard } from './StatCard';
import { useStats } from '../../hooks/useStats';

export function StatGrid() {
  const { stats } = useStats();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}