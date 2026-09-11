import { describe, expect, it } from 'vitest';
import type { Workflow } from '../types';
import { loadWorkflows, saveWorkflows } from './workflowPersistence';

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

const workflow: Workflow = {
  id: 'wf-1',
  name: 'Lead intake',
  description: 'Capture and route leads',
  status: 'active',
  steps: [],
  createdBy: 'local-user',
  updatedAt: new Date('2026-09-11T00:00:00.000Z'),
};

describe('workflow persistence', () => {
  it('round-trips workflow dates as Date instances', () => {
    const storage = memoryStorage();
    saveWorkflows(storage, [workflow]);

    const restored = loadWorkflows(storage, []);
    expect(restored).toHaveLength(1);
    expect(restored[0].updatedAt).toBeInstanceOf(Date);
    expect(restored[0].updatedAt.toISOString()).toBe('2026-09-11T00:00:00.000Z');
  });

  it('fails closed to the supplied fallback when persisted JSON is corrupt', () => {
    const fallback = [{ ...workflow, id: 'fallback' }];
    const storage = memoryStorage({ 'workflowpro.workflows.v1': '{broken' });
    expect(loadWorkflows(storage, fallback)).toEqual(fallback);
  });

  it('drops malformed persisted workflow records', () => {
    const storage = memoryStorage({
      'workflowpro.workflows.v1': JSON.stringify([
        { ...workflow, updatedAt: workflow.updatedAt.toISOString() },
        { id: '', name: 42, updatedAt: 'not-a-date' },
      ]),
    });
    expect(loadWorkflows(storage, [])).toHaveLength(1);
  });
});
