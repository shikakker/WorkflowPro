import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export function RecentWorkflows() {
  const workflows = [
    {
      id: 1,
      name: 'Calendar Sync',
      status: 'active',
      lastRun: '2 minutes ago',
      executions: 245,
    },
    {
      id: 2,
      name: 'Email Campaign Automation',
      status: 'error',
      lastRun: '15 minutes ago',
      executions: 1240,
    },
    {
      id: 3,
      name: 'Data Backup',
      status: 'active',
      lastRun: '1 hour ago',
      executions: 52,
    },
    {
      id: 4,
      name: 'Lead Generation',
      status: 'paused',
      lastRun: '3 hours ago',
      executions: 890,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Workflows</h2>
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {workflows.map((workflow) => (
              <li key={workflow.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {workflow.status === 'active' && (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    )}
                    {workflow.status === 'error' && (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    {workflow.status === 'paused' && (
                      <Clock className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {workflow.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last run {workflow.lastRun} • {workflow.executions} executions
                    </p>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      View details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}