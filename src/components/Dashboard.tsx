import React, { useState } from 'react';
import { Workflow } from 'lucide-react';
import { useWorkflows } from '../hooks/useWorkflows';
import { useWorkflowExecutions } from '../hooks/useWorkflowExecutions';
import { StatGrid } from './stats/StatGrid';
import { RecentWorkflows } from './workflows/RecentWorkflows';
import { IntegrationsList } from './integrations/IntegrationsList';

export function Dashboard() {
  const { workflows, addWorkflow, updateWorkflowStatus, deleteWorkflow } = useWorkflows();
  const {
    executions,
    runWorkflow,
    executingWorkflowIds,
    latestExecutionByWorkflow,
  } = useWorkflowExecutions();
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [providerWorkflowId, setProviderWorkflowId] = useState('');

  const handleCreateWorkflow = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = workflowName.trim();
    if (!name) return;

    const normalizedProviderWorkflowId = providerWorkflowId.trim();
    addWorkflow({
      name,
      description: workflowDescription.trim(),
      status: 'paused',
      providerWorkflowId: normalizedProviderWorkflowId || undefined,
      steps: [],
      createdBy: 'local-user',
    });
    setWorkflowName('');
    setWorkflowDescription('');
    setProviderWorkflowId('');
    setIsCreatingWorkflow(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button
          type="button"
          onClick={() => setIsCreatingWorkflow(value => !value)}
          aria-expanded={isCreatingWorkflow}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Workflow className="h-4 w-4 mr-2" />
          {isCreatingWorkflow ? 'Cancel' : 'New Workflow'}
        </button>
      </div>

      {isCreatingWorkflow && (
        <form onSubmit={handleCreateWorkflow} className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="workflow-name" className="block text-sm font-medium text-gray-700">
              Workflow name
            </label>
            <input
              id="workflow-name"
              value={workflowName}
              onChange={event => setWorkflowName(event.target.value)}
              required
              autoFocus
              maxLength={120}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Lead qualification"
            />
          </div>
          <div>
            <label htmlFor="workflow-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="workflow-description"
              value={workflowDescription}
              onChange={event => setWorkflowDescription(event.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="What this automation should do"
            />
          </div>
          <div>
            <label htmlFor="provider-workflow-id" className="block text-sm font-medium text-gray-700">
              n8n workflow ID (optional)
            </label>
            <input
              id="provider-workflow-id"
              value={providerWorkflowId}
              onChange={event => setProviderWorkflowId(event.target.value)}
              maxLength={200}
              autoComplete="off"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Provider workflow identifier"
            />
            <p className="mt-1 text-xs text-gray-500">
              Required only for Run now. Provider credentials remain server-side and are never stored in this browser form.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreatingWorkflow(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create workflow
            </button>
          </div>
        </form>
      )}

      <StatGrid workflows={workflows} executions={executions} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentWorkflows
          workflows={workflows}
          onStatusChange={updateWorkflowStatus}
          onDelete={deleteWorkflow}
          onExecute={runWorkflow}
          executingWorkflowIds={executingWorkflowIds}
          latestExecutionByWorkflow={latestExecutionByWorkflow}
        />
        <IntegrationsList />
      </div>
    </div>
  );
}
