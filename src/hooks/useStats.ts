import { useState } from 'react';
import { BarChart3, Clock, Workflow, Zap } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
}

export function useStats() {
  const [stats] = useState<Stat[]>([
    {
      title: 'Active Workflows',
      value: '24',
      change: '+4.75%',
      trend: 'up',
      icon: Zap,
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Total Executions',
      value: '1,429',
      change: '+12.5%',
      trend: 'up',
      icon: BarChart3,
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Integrations',
      value: '8',
      change: '0',
      trend: 'neutral',
      icon: Clock,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Success Rate',
      value: '99.2%',
      change: '-0.1%',
      trend: 'down',
      icon: BarChart3,
      iconColor: 'text-purple-600',
    },
  ]);

  return { stats };
}