import type { Workflow, WorkflowStep } from '../types';

export const WORKFLOW_STORAGE_KEY = 'workflowpro.workflows.v1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const WORKFLOW_STATUSES = new Set<Workflow['status']>(['active', 'paused', 'error']);
const STEP_TYPES = new Set<WorkflowStep['type']>(['trigger', 'action', 'condition']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isWorkflowStep(value: unknown): value is WorkflowStep {
  if (!isRecord(value) || !isRecord(value.position) || !isRecord(value.config)) return false;

  return typeof value.id === 'string' && value.id.length > 0
    && typeof value.type === 'string' && STEP_TYPES.has(value.type as WorkflowStep['type'])
    && typeof value.service === 'string'
    && typeof value.position.x === 'number' && Number.isFinite(value.position.x)
    && typeof value.position.y === 'number' && Number.isFinite(value.position.y);
}

function parseWorkflow(value: unknown): Workflow | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || value.id.trim().length === 0) return null;
  if (typeof value.name !== 'string' || value.name.trim().length === 0) return null;
  if (typeof value.description !== 'string') return null;
  if (typeof value.status !== 'string' || !WORKFLOW_STATUSES.has(value.status as Workflow['status'])) return null;
  if (!Array.isArray(value.steps) || !value.steps.every(isWorkflowStep)) return null;
  if (typeof value.createdBy !== 'string' || value.createdBy.trim().length === 0) return null;
  if (typeof value.updatedAt !== 'string' && !(value.updatedAt instanceof Date)) return null;

  const updatedAt = new Date(value.updatedAt);
  if (Number.isNaN(updatedAt.getTime())) return null;

  return {
    id: value.id.trim(),
    name: value.name.trim(),
    description: value.description,
    status: value.status as Workflow['status'],
    steps: value.steps,
    createdBy: value.createdBy.trim(),
    updatedAt,
  };
}

export function loadWorkflows(storage: StorageLike, fallback: Workflow[]): Workflow[] {
  const raw = storage.getItem(WORKFLOW_STORAGE_KEY);
  if (raw === null) return fallback;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map(parseWorkflow).filter((workflow): workflow is Workflow => workflow !== null);
  } catch {
    return fallback;
  }
}

export function saveWorkflows(storage: StorageLike, workflows: Workflow[]): void {
  storage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
}
