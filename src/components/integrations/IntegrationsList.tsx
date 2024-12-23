import React from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import { IntegrationItem } from './IntegrationItem';

export function IntegrationsList() {
  const { integrations } = useIntegrations();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Active Integrations</h2>
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {integrations.map((integration) => (
              <IntegrationItem key={integration.id} {...integration} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}