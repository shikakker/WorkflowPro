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

const workflow = {
  id: 'wf-1',
  name: 'Lead intake',
  description: 'Capture and route leads',
  status: 'active',
  providerWorkflowId: 'provider-wf-17',
  steps: [],
  createdBy: 'local-user',
  updatedAt: new Date('2026-09-11T00:00:00.000Z'),
} satisfies Workflow;

describe('workflow persistence', () => {
  it('round-trips workflow dates and provider execution binding', () => {
    const storage = memoryStorage();
    saveWorkflows(storage, [workflow]);

    const restored = loadWorkflows(storage, []);
    expect(restored).toHaveLength(1);
    expect(restored[0].updatedAt).toBeInstanceOf(Date);
    expect(restored[0].updatedAt.toISOString()).toBe('2026-09-11T00:00:00.000Z');
    expect(restored[0].providerWorkflowId).toBe('provider-wf-17');
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

  it('drops invalid provider workflow ids instead of trusting arbitrary persisted values', () => {
    const storage = memoryStorage({
      'workflowpro.workflows.v1': JSON.stringify([
        {
          ...workflow,
          providerWorkflowId: 42,
          updatedAt: workflow.updatedAt.toISOString(),
        },
      ]),
    });

    expect(loadWorkflows(storage, [workflow])).toEqual([]);
  });
});
