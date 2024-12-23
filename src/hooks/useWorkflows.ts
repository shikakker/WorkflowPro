import { useState } from 'react';
import { Workflow } from '../types';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Calendar Sync',
      description: 'Sync calendar events',
      status: 'active',
      steps: [],
      createdBy: 'user1',
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Email Campaign Automation',
      description: 'Automated email campaigns',
      status: 'error',
      steps: [],
      createdBy: 'user1',
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Data Backup',
      description: 'Automated data backup',
      status: 'active',
      steps: [],
      createdBy: 'user1',
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Lead Generation',
      description: 'Lead generation workflow',
      status: 'paused',
      steps: [],
      createdBy: 'user1',
      updatedAt: new Date(),
    },
  ]);

  const updateWorkflowStatus = (id: string, status: Workflow['status']) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id ? { ...workflow, status, updatedAt: new Date() } : workflow
      )
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
  };

  const addWorkflow = (workflow: Omit<Workflow, 'id' | 'updatedAt'>) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: new Date(),
    };
    setWorkflows(prev => [...prev, newWorkflow]);
  };

  return { 
    workflows,
    updateWorkflowStatus,
    deleteWorkflow,
    addWorkflow
  };
}