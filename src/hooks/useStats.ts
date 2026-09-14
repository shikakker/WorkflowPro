import { BarChart3, Clock, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Workflow } from '../types';
import { deriveWorkflowStats } from '../services/workflowStats';

export interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

export function useStats(workflows: Workflow[]) {
  const snapshot = deriveWorkflowStats(workflows);

  const stats: Stat[] = [
    {
      title: 'Active Workflows',
      value: String(snapshot.activeWorkflows),
      change: `${snapshot.totalWorkflows} total`,
      trend: 'neutral',
      icon: Zap,
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Total Workflows',
      value: String(snapshot.totalWorkflows),
      change: 'Local workspace',
      trend: 'neutral',
      icon: BarChart3,
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Executions',
      value: 'Not tracked',
      change: 'Requires execution history',
      trend: 'neutral',
      icon: Clock,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Success Rate',
      value: 'Not tracked',
      change: 'Requires execution history',
      trend: 'neutral',
      icon: BarChart3,
      iconColor: 'text-purple-600',
    },
  ];

  return { stats };
}
