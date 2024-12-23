import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';
import { Stat } from '../../hooks/useStats';

export function StatCard({ title, value, change, trend, icon: Icon, iconColor }: Stat) {
  const trendConfig = {
    up: { icon: ArrowUpIcon, color: 'text-green-600' },
    down: { icon: ArrowDownIcon, color: 'text-red-600' },
    neutral: { icon: MinusIcon, color: 'text-gray-500' },
  };

  const { icon: TrendIcon, color } = trendConfig[trend];

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${color}`}>
                  <TrendIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="ml-1">{change}</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}