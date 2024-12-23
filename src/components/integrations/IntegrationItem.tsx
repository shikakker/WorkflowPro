import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IntegrationItemProps {
  name: string;
  icon: LucideIcon;
  iconColor: string;
  status: string;
  lastSync: string;
}

export function IntegrationItem({ name, icon: Icon, iconColor, status, lastSync }: IntegrationItemProps) {
  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-sm text-gray-500">
            {status} • Last sync {lastSync}
          </p>
        </div>
        <div>
          <button className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Configure
          </button>
        </div>
      </div>
    </li>
  );
}