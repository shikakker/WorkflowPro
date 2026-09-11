import { describe, expect, it } from 'vitest';
import { requestWorkflowExecution } from './workflowExecutionClient';

describe('workflow execution client seam', () => {
  it('posts only workflow data to the same-origin execution API', async () => {
    let requestUrl = '';
    let requestInit: RequestInit | undefined;

    const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
      requestUrl = String(input);
      requestInit = init;
      return new Response(JSON.stringify({ status: 'succeeded', providerExecutionId: 'exec-42' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const result = await requestWorkflowExecution(
      { workflowId: '42', payload: { leadId: 'abc' } },
      fetcher,
    );

    expect(requestUrl).toBe('/api/workflows/execute');
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      workflowId: '42',
      payload: { leadId: 'abc' },
    });
    expect(JSON.stringify(requestInit)).not.toContain('apiKey');
    expect(JSON.stringify(requestInit)).not.toContain('baseUrl');
    expect(result).toEqual({ status: 'succeeded', providerExecutionId: 'exec-42' });
  });

  it('maps non-success API responses to a sanitized failed result', async () => {
    const fetcher = async () => new Response(JSON.stringify({ error: 'Execution unavailable' }), { status: 503 });

    await expect(
      requestWorkflowExecution({ workflowId: '42', payload: {} }, fetcher),
    ).resolves.toEqual({ status: 'failed', error: 'Execution unavailable' });
  });
});
