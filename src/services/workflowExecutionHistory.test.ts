import { describe, expect, it } from 'vitest';
import {
  deriveExecutionHistoryStats,
  loadExecutionHistory,
  recoverInterruptedExecutions,
  saveExecutionHistory,
  type WorkflowExecutionRecord,
} from './workflowExecutionHistory';

function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
    read: () => value,
  };
}

const records: WorkflowExecutionRecord[] = [
  {
    id: 'run-1',
    workflowId: 'wf-1',
    workflowName: 'Lead sync',
    status: 'succeeded',
    startedAt: new Date('2026-09-15T10:00:00.000Z'),
    completedAt: new Date('2026-09-15T10:00:02.000Z'),
    providerExecutionId: 'provider-1',
  },
  {
    id: 'run-2',
    workflowId: 'wf-1',
    workflowName: 'Lead sync',
    status: 'failed',
    startedAt: new Date('2026-09-15T11:00:00.000Z'),
    completedAt: new Date('2026-09-15T11:00:03.000Z'),
    error: 'Provider request failed (500)',
  },
  {
    id: 'run-3',
    workflowId: 'wf-2',
    workflowName: 'CRM enrichment',
    status: 'running',
    startedAt: new Date('2026-09-15T12:00:00.000Z'),
  },
];

describe('workflow execution history', () => {
  it('persists bounded history and restores Date fields', () => {
    const storage = memoryStorage();
    saveExecutionHistory(storage, records);

    const loaded = loadExecutionHistory(storage);
    expect(loaded).toHaveLength(3);
    expect(loaded[0].startedAt).toBeInstanceOf(Date);
    expect(loaded[0].completedAt).toBeInstanceOf(Date);
    expect(loaded[0].providerExecutionId).toBe('provider-1');
  });

  it('fails closed on malformed or unsupported records', () => {
    const storage = memoryStorage(JSON.stringify([
      { id: 'bad', workflowId: '', status: 'succeeded', startedAt: 'not-a-date' },
    ]));

    expect(loadExecutionHistory(storage)).toEqual([]);
  });

  it('keeps only the newest 100 execution records', () => {
    const storage = memoryStorage();
    const many = Array.from({ length: 105 }, (_, index): WorkflowExecutionRecord => ({
      id: `run-${index}`,
      workflowId: 'wf-1',
      workflowName: 'Lead sync',
      status: 'succeeded',
      startedAt: new Date(2026, 0, 1, 0, 0, index),
      completedAt: new Date(2026, 0, 1, 0, 0, index + 1),
    }));

    saveExecutionHistory(storage, many);
    const loaded = loadExecutionHistory(storage);

    expect(loaded).toHaveLength(100);
    expect(loaded[0].id).toBe('run-0');
    expect(loaded.at(-1)?.id).toBe('run-99');
  });

  it('derives truthful execution totals and success rate from completed runs', () => {
    expect(deriveExecutionHistoryStats(records)).toEqual({
      totalExecutions: 3,
      completedExecutions: 2,
      runningExecutions: 1,
      successfulExecutions: 1,
      failedExecutions: 1,
      successRate: 50,
    });
  });

  it('marks runs left running across a reload as interrupted failures', () => {
    const recoveredAt = new Date('2026-09-15T12:30:00.000Z');
    const recovered = recoverInterruptedExecutions(records, recoveredAt);

    expect(recovered[2]).toMatchObject({
      status: 'failed',
      error: 'Execution was interrupted before completion',
    });
    expect(recovered[2].completedAt?.toISOString()).toBe(recoveredAt.toISOString());
    expect(recovered[0]).toEqual(records[0]);
  });
});
