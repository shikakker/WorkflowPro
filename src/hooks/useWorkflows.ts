import { useEffect, useState } from 'react';
import type { Workflow } from '../types';
import { loadWorkflows, saveWorkflows } from '../services/workflowPersistence';

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: '1',
    name: 'Calendar Sync',
    description: 'Sync calendar events',
    status: 'active',
    steps: [],
    createdBy: 'local-user',
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Email Campaign Automation',
    description: 'Automated email campaigns',
    status: 'error',
    steps: [],
    createdBy: 'local-user',
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Data Backup',
    description: 'Automated data backup',
    status: 'active',
    steps: [],
    createdBy: 'local-user',
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Lead Generation',
    description: 'Lead generation workflow',
    status: 'paused',
    steps: [],
    createdBy: 'local-user',
    updatedAt: new Date(),
  },
];

function createWorkflowId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOWS;
    return loadWorkflows(window.localStorage, DEFAULT_WORKFLOWS);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveWorkflows(window.localStorage, workflows);
  }, [workflows]);

  const updateWorkflowStatus = (id: string, status: Workflow['status']) => {
    setWorkflows(prev =>
      prev.map(workflow =>
        workflow.id === id ? { ...workflow, status, updatedAt: new Date() } : workflow,
      ),
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
  };

  const addWorkflow = (workflow: Omit<Workflow, 'id' | 'updatedAt'>) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: createWorkflowId(),
      updatedAt: new Date(),
    };
    setWorkflows(prev => [newWorkflow, ...prev]);
    return newWorkflow;
  };

  return {
    workflows,
    updateWorkflowStatus,
    deleteWorkflow,
    addWorkflow,
  };
}
