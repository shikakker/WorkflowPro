import React from 'react';
import { Calendar, Settings, Workflow } from 'lucide-react';

export function IntegrationsList() {
  const integrations = [
    {
      id: 1,
      name: 'Make.com',
      icon: <Workflow className="h-8 w-8 text-purple-600" />,
      status: 'Connected',
      lastSync: '5 minutes ago',
    },
    {
      id: 2,
      name: 'n8n',
      icon: <Settings className="h-8 w-8 text-blue-600" />,
      status: 'Connected',
      lastSync: '10 minutes ago',
    },
    {
      id: 3,
      name: 'Google Calendar',
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      status: 'Connected',
      lastSync: '1 hour ago',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Active Integrations</h2>
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {integrations.map((integration) => (
              <li key={integration.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{integration.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {integration.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {integration.status} • Last sync {integration.lastSync}
                    </p>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Configure
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