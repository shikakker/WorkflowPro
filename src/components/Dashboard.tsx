import React from 'react';
import { Workflow } from 'lucide-react';
import { StatGrid } from './stats/StatGrid';
import { RecentWorkflows } from './workflows/RecentWorkflows';
import { IntegrationsList } from './integrations/IntegrationsList';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Workflow className="h-4 w-4 mr-2" />
          New Workflow
        </button>
      </div>

      <StatGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentWorkflows />
        <IntegrationsList />
      </div>
    </div>
  );
}