export type SafeWorkflowRequest = {
  workflowId: string;
  payload: Record<string, unknown>;
};

export class WorkflowPayloadTooLargeError extends Error {
  constructor() {
    super('Workflow payload exceeds the 32 KiB limit');
    this.name = 'WorkflowPayloadTooLargeError';
  }
}

const MAX_PAYLOAD_BYTES = 32 * 1024;

function isSafeJson(value: unknown, depth = 0, seen = new WeakSet<object>()): boolean {
  if (depth > 8) return false;
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (!value || typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) {
    if (value.length > 100) return false;
    return value.every(item => isSafeJson(item, depth + 1, seen));
  }
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return false;
  const entries = Object.entries(value);
  if (entries.length > 100) return false;
  return entries.every(([key, item]) =>
    key.length <= 128 &&
    key !== '__proto__' &&
    key !== 'constructor' &&
    key !== 'prototype' &&
    isSafeJson(item, depth + 1, seen));
}

/** Validate browser payloads before any privileged n8n outbound request. */
export function parseSafeWorkflowRequest(body: unknown): SafeWorkflowRequest | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const request = body as Record<string, unknown>;
  const workflowId = typeof request.workflowId === 'string' ? request.workflowId.trim() : '';
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(workflowId)) return null;
  const payload = request.payload === undefined ? {} : request.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !isSafeJson(payload)) return null;
  let serialized: string;
  try {
    serialized = JSON.stringify(payload);
  } catch {
    return null;
  }
  if (new TextEncoder().encode(serialized).byteLength > MAX_PAYLOAD_BYTES) {
    throw new WorkflowPayloadTooLargeError();
  }
  return { workflowId, payload: payload as Record<string, unknown> };
}
