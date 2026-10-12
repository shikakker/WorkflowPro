import { describe, expect, it } from 'vitest';
import { executeN8nWorkflow, validateN8nConfig } from './workflowExecution';

describe('n8n execution boundary', () => {
  it('rejects missing server-side provider configuration', () => {
    expect(() => validateN8nConfig({ baseUrl: '', apiKey: '' })).toThrow(/configuration/i);
  });

  it('maps a successful provider response to succeeded state', async () => {
    const fetcher = async () => new Response(JSON.stringify({ executionId: 'exec-1' }), { status: 200 });
    const result = await executeN8nWorkflow(
      { workflowId: '42', payload: { leadId: 'abc' } },
      { baseUrl: 'https://n8n.example.test', apiKey: 'server-secret' },
      fetcher,
    );

    expect(result.status).toBe('succeeded');
    expect(result.providerExecutionId).toBe('exec-1');
  });

  it('does not fabricate success when provider returns invalid JSON or omits an execution id', async () => {
    for (const body of ['not-json', '{}', '{"executionId":""}', '{"executionId":{"unexpected":"object"}}']) {
      const fetcher = async () => new Response(body, { status: 200 });
      const result = await executeN8nWorkflow(
        { workflowId: '42', payload: { example: true } },
        { baseUrl: 'https://n8n.example.test', apiKey: 'server-secret' },
        fetcher,
      );
      expect(result.status).toBe('failed');
      expect(result.providerExecutionId).toBeUndefined();
      expect(result.error).toMatch(/provider/i);
      expect(JSON.stringify(result)).not.toContain('server-secret');
    }
  });

  it('maps provider failures to failed state without leaking credentials', async () => {
    const fetcher = async () => new Response('provider exploded', { status: 500 });
    const result = await executeN8nWorkflow(
      { workflowId: '42', payload: {} },
      { baseUrl: 'https://n8n.example.test', apiKey: 'server-secret' },
      fetcher,
    );

    expect(result.status).toBe('failed');
    expect(result.error).toMatch(/provider/i);
    expect(result.error).not.toContain('server-secret');
  });
});
