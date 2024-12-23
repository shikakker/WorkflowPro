import { useState } from 'react';
import { Calendar, Settings, Workflow } from 'lucide-react';

export function useIntegrations() {
  const [integrations] = useState([
    {
      id: 1,
      name: 'Make.com',
      icon: Workflow,
      iconColor: 'text-purple-600',
      status: 'Connected',
      lastSync: '5 minutes ago',
    },
    {
      id: 2,
      name: 'n8n',
      icon: Settings,
      iconColor: 'text-blue-600',
      status: 'Connected',
      lastSync: '10 minutes ago',
    },
    {
      id: 3,
      name: 'Google Calendar',
      icon: Calendar,
      iconColor: 'text-green-600',
      status: 'Connected',
      lastSync: '1 hour ago',
    },
  ]);

  return { integrations };
}