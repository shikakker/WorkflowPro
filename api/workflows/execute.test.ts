import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './execute';

type ResponseCapture = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
};

function createResponse() {
  const capture: ResponseCapture = { statusCode: 200, body: undefined, headers: {} };
  const response = {
    status(code: number) {
      capture.statusCode = code;
      return response;
    },
    json(body: unknown) {
      capture.body = body;
    },
    setHeader(name: string, value: string) {
      capture.headers[name.toLowerCase()] = value;
    },
  };
  return { response, capture };
}

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.N8N_BASE_URL;
  delete process.env.N8N_API_KEY;
  vi.restoreAllMocks();
});

describe('POST /api/workflows/execute', () => {
  it('fails closed when server-owned n8n configuration is missing', async () => {
    const { response, capture } = createResponse();

    await handler({ method: 'POST', body: { workflowId: '42', payload: {} } }, response);

    expect(capture.statusCode).toBe(503);
    expect(capture.body).toEqual({ error: 'Workflow execution is not configured' });
    expect(capture.headers['cache-control']).toBe('no-store');
  });

  it('uses server environment credentials and never requires them from the browser request', async () => {
    process.env.N8N_BASE_URL = 'https://n8n.example.test';
    process.env.N8N_API_KEY = 'server-secret';

    let upstreamHeaders: HeadersInit | undefined;
    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      upstreamHeaders = init?.headers;
      return new Response(JSON.stringify({ executionId: 'exec-9' }), { status: 200 });
    }) as typeof fetch;

    const { response, capture } = createResponse();
    await handler({ method: 'POST', body: { workflowId: '42', payload: { leadId: 'abc' } } }, response);

    expect(capture.statusCode).toBe(200);
    expect(capture.body).toEqual({ status: 'succeeded', providerExecutionId: 'exec-9' });
    expect(JSON.stringify(upstreamHeaders)).toContain('server-secret');
    expect(JSON.stringify(capture.body)).not.toContain('server-secret');
  });
});
