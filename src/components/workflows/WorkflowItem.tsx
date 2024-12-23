import React from 'react';
import { MoreVertical, Play, Pause, Trash2 } from 'lucide-react';
import { WorkflowStatus } from './WorkflowStatus';
import { Workflow } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface WorkflowItemProps {
  workflow: Workflow;
  onStatusChange: (id: string, status: Workflow['status']) => void;
  onDelete: (id: string) => void;
}

export function WorkflowItem({ workflow, onStatusChange, onDelete }: WorkflowItemProps) {
  const [showActions, setShowActions] = React.useState(false);

  const toggleStatus = () => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    onStatusChange(workflow.id, newStatus);
  };

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
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleStatus}
            className="p-1 rounded-full hover:bg-gray-100"
            title={workflow.status === 'active' ? 'Pause workflow' : 'Start workflow'}
          >
            {workflow.status === 'active' ? (
              <Pause className="h-4 w-4 text-gray-500" />
            ) : (
              <Play className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
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