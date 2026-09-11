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

    const payload = (await response.json().catch(() => ({}))) as {
      executionId?: string | number;
      id?: string | number;
    };
    const providerExecutionId = payload.executionId ?? payload.id;

    return {
      status: 'succeeded',
      providerExecutionId: providerExecutionId == null ? undefined : String(providerExecutionId),
    };
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
