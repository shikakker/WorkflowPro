import { BarChart3, Clock, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Workflow } from '../types';
import { deriveWorkflowStats } from '../services/workflowStats';
import {
  deriveExecutionHistoryStats,
  type WorkflowExecutionRecord,
} from '../services/workflowExecutionHistory';

export interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

export function useStats(workflows: Workflow[], executions: WorkflowExecutionRecord[]) {
  const snapshot = deriveWorkflowStats(workflows);
  const executionStats = deriveExecutionHistoryStats(executions);

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
      value: String(executionStats.totalExecutions),
      change: executionStats.runningExecutions > 0
        ? `${executionStats.runningExecutions} running`
        : `${executionStats.completedExecutions} completed`,
      trend: 'neutral',
      icon: Clock,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Success Rate',
      value: executionStats.successRate === null ? '—' : `${executionStats.successRate}%`,
      change: executionStats.completedExecutions === 0
        ? 'No completed runs yet'
        : `${executionStats.successfulExecutions} succeeded · ${executionStats.failedExecutions} failed`,
      trend: 'neutral',
      icon: BarChart3,
      iconColor: 'text-purple-600',
    },
  ];

  return { stats };
}
