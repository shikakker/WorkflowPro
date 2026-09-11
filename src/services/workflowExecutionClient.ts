import type { N8nExecutionRequest, WorkflowExecutionResult } from './workflowExecution';

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function requestWorkflowExecution(
  request: N8nExecutionRequest,
  fetcher: Fetcher = fetch,
): Promise<WorkflowExecutionResult> {
  const response = await fetcher('/api/workflows/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowId: request.workflowId,
      payload: request.payload ?? {},
    }),
  });

  const body = (await response.json().catch(() => ({}))) as Partial<WorkflowExecutionResult> & {
    error?: string;
  };

  if (!response.ok) {
    return {
      status: 'failed',
      error: typeof body.error === 'string' && body.error.trim()
        ? body.error.trim().slice(0, 200)
        : `Execution request failed (${response.status})`,
    };
  }

  if (body.status !== 'succeeded' && body.status !== 'failed') {
    return { status: 'failed', error: 'Execution API returned an invalid response' };
  }

  return {
    status: body.status,
    providerExecutionId: typeof body.providerExecutionId === 'string'
      ? body.providerExecutionId.slice(0, 200)
      : undefined,
    error: typeof body.error === 'string' ? body.error.slice(0, 200) : undefined,
  };
}
