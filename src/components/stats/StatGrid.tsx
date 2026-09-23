import React from 'react';
import { StatCard } from './StatCard';
import { useStats } from '../../hooks/useStats';
import type { Workflow } from '../../types';
import type { WorkflowExecutionRecord } from '../../services/workflowExecutionHistory';

interface StatGridProps {
  workflows: Workflow[];
  executions: WorkflowExecutionRecord[];
}

export function StatGrid({ workflows, executions }: StatGridProps) {
  const { stats } = useStats(workflows, executions);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
