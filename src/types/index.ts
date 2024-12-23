export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  service: 'make' | 'n8n' | 'google_calendar';
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  steps: WorkflowStep[];
  createdBy: string;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  service: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}