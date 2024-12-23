import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface WorkflowStatusProps {
  status: 'active' | 'error' | 'paused';
}

export function WorkflowStatus({ status }: WorkflowStatusProps) {
  const statusConfig = {
    active: { icon: CheckCircle2, color: 'text-green-500' },
    error: { icon: XCircle, color: 'text-red-500' },
    paused: { icon: Clock, color: 'text-yellow-500' },
  };

  const { icon: Icon, color } = statusConfig[status];
  return <Icon className={`h-6 w-6 ${color}`} />;
}