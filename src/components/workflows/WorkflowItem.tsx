import React from 'react';
import { Loader2, MoreVertical, Pause, Play, PlayCircle, Trash2 } from 'lucide-react';
import { WorkflowStatus } from './WorkflowStatus';
import type { Workflow } from '../../types';
import type { WorkflowExecutionRecord } from '../../services/workflowExecutionHistory';
import { formatRelativeTime } from '../../utils/formatters';

interface WorkflowItemProps {
  workflow: Workflow;
  onStatusChange: (id: string, status: Workflow['status']) => void;
  onDelete: (id: string) => void;
  onExecute: (workflow: Workflow) => void;
  isExecuting: boolean;
  latestExecution?: WorkflowExecutionRecord;
}

export function WorkflowItem({
  workflow,
  onStatusChange,
  onDelete,
  onExecute,
  isExecuting,
  latestExecution,
}: WorkflowItemProps) {
  const [showActions, setShowActions] = React.useState(false);

  const toggleStatus = () => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    onStatusChange(workflow.id, newStatus);
  };

  const runBlockedReason = isExecuting
    ? 'Workflow is already running'
    : workflow.status !== 'active'
      ? 'Activate workflow before running it'
      : !workflow.providerWorkflowId
        ? 'Set an n8n workflow ID before running it'
        : null;

  const executionSummary = latestExecution
    ? latestExecution.status === 'running'
      ? 'Running now'
      : `Last run ${latestExecution.status}${latestExecution.completedAt ? ` ${formatRelativeTime(latestExecution.completedAt)}` : ''}${latestExecution.error ? ` · ${latestExecution.error}` : ''}`
    : workflow.providerWorkflowId
      ? 'No runs recorded yet'
      : 'No n8n workflow ID configured';

  return (
    <li className="py-4 hover:bg-gray-50 relative group">
      <div className="flex items-center space-x-4 px-4">
        <div className="flex-shrink-0">
          <WorkflowStatus status={workflow.status} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {workflow.name}
          </p>
          <p className="text-sm text-gray-500">
            Last updated {formatRelativeTime(workflow.updatedAt)} • {workflow.steps.length} steps
          </p>
          <p
            className={`mt-1 text-xs ${latestExecution?.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}
            aria-live="polite"
          >
            {executionSummary}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onExecute(workflow)}
            disabled={runBlockedReason !== null}
            title={runBlockedReason ?? 'Run now'}
            aria-label={runBlockedReason ?? `Run ${workflow.name} now`}
            className="p-1 rounded-full hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            ) : (
              <PlayCircle className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleStatus}
            className="p-1 rounded-full hover:bg-gray-100"
            title={workflow.status === 'active' ? 'Pause workflow' : 'Activate workflow'}
            aria-label={workflow.status === 'active' ? `Pause ${workflow.name}` : `Activate ${workflow.name}`}
          >
            {workflow.status === 'active' ? (
              <Pause className="h-4 w-4 text-gray-500" />
            ) : (
              <Play className="h-4 w-4 text-gray-500" />
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label={`More actions for ${workflow.name}`}
              aria-expanded={showActions}
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(workflow.id);
                      setShowActions(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Workflow
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
