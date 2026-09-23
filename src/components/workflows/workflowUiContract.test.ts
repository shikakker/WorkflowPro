import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const dashboardUrl = new URL('../Dashboard.tsx', import.meta.url);
const recentUrl = new URL('./RecentWorkflows.tsx', import.meta.url);
const itemUrl = new URL('./WorkflowItem.tsx', import.meta.url);
const hookUrl = new URL('../../hooks/useWorkflows.ts', import.meta.url);
const executionHookUrl = new URL('../../hooks/useWorkflowExecutions.ts', import.meta.url);
const statsHookUrl = new URL('../../hooks/useStats.ts', import.meta.url);

async function source(url: URL) {
  return readFile(url, 'utf8');
}

describe('workflow dashboard state ownership', () => {
  it('owns one workflow hook and exposes a real create interaction', async () => {
    const dashboard = await source(dashboardUrl);
    expect(dashboard).toContain("from '../hooks/useWorkflows'");
    expect(dashboard).toMatch(/const\s*\{[^}]*workflows[^}]*addWorkflow[^}]*\}\s*=\s*useWorkflows\(\)/s);
    expect(dashboard).toContain('onSubmit={handleCreateWorkflow}');
    expect(dashboard).toContain('addWorkflow({');
    expect(dashboard).toContain('onClick={() => setIsCreatingWorkflow');
  });

  it('captures an optional provider workflow id when creating a runnable workflow', async () => {
    const dashboard = await source(dashboardUrl);
    expect(dashboard).toContain('providerWorkflowId');
    expect(dashboard).toContain('n8n workflow ID');
  });

  it('passes shared state into RecentWorkflows instead of creating another workflow hook instance', async () => {
    const dashboard = await source(dashboardUrl);
    const recent = await source(recentUrl);

    expect(dashboard).toContain('workflows={workflows}');
    expect(dashboard).toContain('onStatusChange={updateWorkflowStatus}');
    expect(dashboard).toContain('onDelete={deleteWorkflow}');
    expect(recent).not.toContain("from '../../hooks/useWorkflows'");
    expect(recent).not.toContain('useWorkflows()');
  });

  it('restores and saves the shared workflow collection through the persistence module', async () => {
    const hook = await source(hookUrl);
    expect(hook).toContain("from '../services/workflowPersistence'");
    expect(hook).toContain('loadWorkflows(window.localStorage');
    expect(hook).toContain('saveWorkflows(window.localStorage, workflows)');
    expect(hook).toContain('crypto.randomUUID()');
  });

  it('owns execution history at the dashboard boundary and routes Run now through the server client', async () => {
    const dashboard = await source(dashboardUrl);
    const executionHook = await source(executionHookUrl);
    const item = await source(itemUrl);

    expect(dashboard).toContain('useWorkflowExecutions()');
    expect(dashboard).toContain('onExecute={runWorkflow}');
    expect(dashboard).toContain('executions={executions}');
    expect(executionHook).toContain('requestWorkflowExecution');
    expect(executionHook).toContain('saveExecutionHistory(window.localStorage, executions)');
    expect(item).toContain('Run now');
    expect(item).toContain('providerWorkflowId');
  });

  it('derives dashboard execution totals and success rate from persisted history', async () => {
    const stats = await source(statsHookUrl);
    expect(stats).toContain('deriveExecutionHistoryStats');
    expect(stats).toContain('Total Executions');
    expect(stats).toContain('Success Rate');
    expect(stats).not.toContain("value: 'Not tracked'");
  });
});
