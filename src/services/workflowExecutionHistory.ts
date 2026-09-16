export const EXECUTION_HISTORY_STORAGE_KEY = 'workflowpro.executions.v1';
export const MAX_EXECUTION_HISTORY = 100;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export type WorkflowExecutionRecordStatus = 'running' | 'succeeded' | 'failed';

export interface WorkflowExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowExecutionRecordStatus;
  startedAt: Date;
  completedAt?: Date;
  providerExecutionId?: string;
  error?: string;
}

export interface ExecutionHistoryStats {
  totalExecutions: number;
  completedExecutions: number;
  runningExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' && !(value instanceof Date)) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseExecutionRecord(value: unknown): WorkflowExecutionRecord | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || !value.id.trim()) return null;
  if (typeof value.workflowId !== 'string' || !value.workflowId.trim()) return null;
  if (typeof value.workflowName !== 'string' || !value.workflowName.trim()) return null;
  if (value.status !== 'running' && value.status !== 'succeeded' && value.status !== 'failed') return null;

  const startedAt = parseDate(value.startedAt);
  if (!startedAt) return null;

  const completedAt = value.completedAt === undefined ? undefined : parseDate(value.completedAt);
  if (value.completedAt !== undefined && !completedAt) return null;
  if (value.status !== 'running' && !completedAt) return null;

  const providerExecutionId = typeof value.providerExecutionId === 'string'
    ? value.providerExecutionId.trim().slice(0, 200)
    : undefined;
  const error = typeof value.error === 'string'
    ? value.error.trim().slice(0, 200)
    : undefined;

  return {
    id: value.id.trim().slice(0, 200),
    workflowId: value.workflowId.trim().slice(0, 200),
    workflowName: value.workflowName.trim().slice(0, 120),
    status: value.status,
    startedAt,
    completedAt,
    providerExecutionId: providerExecutionId || undefined,
    error: error || undefined,
  };
}

export function loadExecutionHistory(storage: StorageLike): WorkflowExecutionRecord[] {
  const raw = storage.getItem(EXECUTION_HISTORY_STORAGE_KEY);
  if (raw === null) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseExecutionRecord)
      .filter((record): record is WorkflowExecutionRecord => record !== null)
      .slice(0, MAX_EXECUTION_HISTORY);
  } catch {
    return [];
  }
}

export function saveExecutionHistory(
  storage: StorageLike,
  records: WorkflowExecutionRecord[],
): void {
  storage.setItem(
    EXECUTION_HISTORY_STORAGE_KEY,
    JSON.stringify(records.slice(0, MAX_EXECUTION_HISTORY)),
  );
}

export function deriveExecutionHistoryStats(
  records: WorkflowExecutionRecord[],
): ExecutionHistoryStats {
  const completed = records.filter(record => record.status !== 'running');
  const successfulExecutions = completed.filter(record => record.status === 'succeeded').length;
  const failedExecutions = completed.filter(record => record.status === 'failed').length;

  return {
    totalExecutions: records.length,
    completedExecutions: completed.length,
    runningExecutions: records.length - completed.length,
    successfulExecutions,
    failedExecutions,
    successRate: completed.length === 0
      ? null
      : Math.round((successfulExecutions / completed.length) * 100),
  };
}
