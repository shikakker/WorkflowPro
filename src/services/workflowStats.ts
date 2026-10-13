import type { Workflow } from '../types';

export interface WorkflowStatsSnapshot {
  activeWorkflows: number;
  totalWorkflows: number;
  executionCount: number | null;
  successRate: number | null;
}

export function deriveWorkflowStats(workflows: Workflow[]): WorkflowStatsSnapshot {
  return {
    activeWorkflows: workflows.filter(workflow => workflow.status === 'active').length,
    totalWorkflows: workflows.length,
    executionCount: null,
    successRate: null,
  };
}
