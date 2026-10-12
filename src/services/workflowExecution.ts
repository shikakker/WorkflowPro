export type WorkflowExecutionStatus = 'succeeded' | 'failed';

export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
}

export interface N8nExecutionRequest {
  workflowId: string;
  payload: Record<string, unknown>;
}

export interface WorkflowExecutionResult {
  status: WorkflowExecutionStatus;
  providerExecutionId?: string;
  error?: string;
}

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const DEFAULT_TIMEOUT_MS = 15_000;

export function validateN8nConfig(config: N8nConfig): Required<N8nConfig> {
  const baseUrl = config.baseUrl.trim().replace(/\/+$/, '');
  const apiKey = config.apiKey.trim();

  if (!baseUrl || !apiKey) {
    throw new Error('n8n provider configuration is incomplete');
  }

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error('n8n provider configuration contains an invalid base URL');
  }

  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
    throw new Error('n8n provider configuration must use HTTPS outside local development');
  }

  return { baseUrl, apiKey };
}

export async function executeN8nWorkflow(
  request: N8nExecutionRequest,
  rawConfig: N8nConfig,
  fetcher: Fetcher = fetch,
): Promise<WorkflowExecutionResult> {
  const config = validateN8nConfig(rawConfig);
  const workflowId = request.workflowId.trim();

  if (!workflowId) {
    return { status: 'failed', error: 'Provider workflow id is required' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetcher(
      `${config.baseUrl}/api/v1/workflows/${encodeURIComponent(workflowId)}/run`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': config.apiKey,
        },
        body: JSON.stringify(request.payload ?? {}),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return {
        status: 'failed',
        error: `Provider request failed (${response.status})`,
      };
    }

    // HTTP 2xx alone is not evidence that n8n accepted and created a run.
    // Invalid/missing execution identifiers must remain visible failures.
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { status: 'failed', error: 'Provider response was invalid' };
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { status: 'failed', error: 'Provider response was invalid' };
    }
    const record = payload as Record<string, unknown>;
    const rawId = record.executionId ?? record.id;
    const providerExecutionId = typeof rawId === 'string'
      ? rawId.trim()
      : typeof rawId === 'number' && Number.isSafeInteger(rawId) && rawId >= 0
        ? String(rawId)
        : '';
    if (!providerExecutionId || providerExecutionId.length > 256) {
      return { status: 'failed', error: 'Provider did not return a valid execution id' };
    }

    return { status: 'succeeded', providerExecutionId };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    return {
      status: 'failed',
      error: timedOut ? 'Provider request timed out' : 'Provider request failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}
