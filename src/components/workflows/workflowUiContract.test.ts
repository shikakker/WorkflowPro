import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const dashboardUrl = new URL('../Dashboard.tsx', import.meta.url);
const recentUrl = new URL('./RecentWorkflows.tsx', import.meta.url);

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

  it('passes shared state into RecentWorkflows instead of creating another hook instance', async () => {
    const dashboard = await source(dashboardUrl);
    const recent = await source(recentUrl);

    expect(dashboard).toContain('workflows={workflows}');
    expect(dashboard).toContain('onStatusChange={updateWorkflowStatus}');
    expect(dashboard).toContain('onDelete={deleteWorkflow}');
    expect(recent).not.toContain("from '../../hooks/useWorkflows'");
    expect(recent).not.toContain('useWorkflows()');
  });
});
