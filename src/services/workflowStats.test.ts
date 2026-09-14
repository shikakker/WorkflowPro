import { describe, expect, it } from 'vitest';
import { deriveWorkflowStats } from './workflowStats';
import type { Workflow } from '../types';

const workflow = (id: string, status: Workflow['status']): Workflow => ({
  id,
  name: `Workflow ${id}`,
  description: '',
  status,
  steps: [],
  createdBy: 'local-user',
  updatedAt: new Date('2026-09-15T00:00:00.000Z'),
});

describe('deriveWorkflowStats', () => {
  it('derives workflow counts from current durable-local state without inventing execution metrics', () => {
    const stats = deriveWorkflowStats([
      workflow('active-1', 'active'),
      workflow('active-2', 'active'),
      workflow('paused-1', 'paused'),
      workflow('error-1', 'error'),
    ]);

    expect(stats).toEqual({
      activeWorkflows: 2,
      totalWorkflows: 4,
      executionCount: null,
      successRate: null,
    });
  });

  it('returns zero workflow counts for an empty local workspace', () => {
    expect(deriveWorkflowStats([])).toEqual({
      activeWorkflows: 0,
      totalWorkflows: 0,
      executionCount: null,
      successRate: null,
    });
  });
});
