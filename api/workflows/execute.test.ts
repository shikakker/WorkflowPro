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
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.N8N_BASE_URL;
  delete process.env.N8N_API_KEY;
  delete process.env.WORKFLOWPRO_ALLOW_PUBLIC_EXECUTION;
  process.env.NODE_ENV = originalNodeEnv;
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


describe('production execution boundary', () => {
  it('fails closed in production unless public execution is explicitly enabled', async () => {
    process.env.NODE_ENV = 'production';
    process.env.N8N_BASE_URL = 'https://n8n.example.test';
    process.env.N8N_API_KEY = 'server-secret';
    const { response, capture } = createResponse();

    await handler({
      method: 'POST',
      headers: { origin: 'https://workflow.example', host: 'workflow.example' },
      body: { workflowId: '42', payload: {} },
    }, response);

    expect(capture.statusCode).toBe(503);
    expect(capture.body).toEqual({ error: 'Workflow execution is disabled in production' });
  });

  it('rejects origin-less production execution even after explicit opt-in', async () => {
    process.env.NODE_ENV = 'production';
    process.env.WORKFLOWPRO_ALLOW_PUBLIC_EXECUTION = 'true';
    process.env.N8N_BASE_URL = 'https://n8n.example.test';
    process.env.N8N_API_KEY = 'server-secret';
    const { response, capture } = createResponse();

    await handler({ method: 'POST', body: { workflowId: '42', payload: {} } }, response);

    expect(capture.statusCode).toBe(403);
    expect(capture.body).toEqual({ error: 'Cross-origin workflow execution is not allowed' });
  });


  it('requires explicit server allowlist before executing a configured workflow', async () => {
    process.env.NODE_ENV = 'production';
    process.env.WORKFLOWPRO_ALLOW_PUBLIC_EXECUTION = 'true';
    process.env.N8N_BASE_URL = 'https://n8n.example.test';
    process.env.N8N_API_KEY = 'server-secret';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const input = {
      method: 'POST',
      headers: { host: 'workflow.example', origin: 'https://workflow.example' },
      body: { workflowId: 'admin-unlisted', payload: {} },
    };
    const { response, capture } = createResponse();
    await handler(input, response);
    expect(capture.statusCode).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();

    process.env.WORKFLOWPRO_ALLOWED_N8N_WORKFLOW_IDS = 'public-leads, approved-task';
    const { response: allowedRes, capture: allowedCapture } = createResponse();
    await handler(input, allowedRes);
    expect(allowedCapture.statusCode).toBe(403);

    const { response: configuredRes, capture: configuredCapture } = createResponse();
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ executionId: 'exec-demo' }), { status: 200 }));
    await handler({ ...input, body: { workflowId: 'public-leads', payload: {} } }, configuredRes);
    expect(configuredCapture.statusCode).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('refuses spoofed forwarded Host and same-site requests before any n8n action', async () => {
    process.env.NODE_ENV = 'production';
    process.env.WORKFLOWPRO_ALLOW_PUBLIC_EXECUTION = 'true';
    process.env.N8N_BASE_URL = 'https://n8n.example.test';
    process.env.N8N_API_KEY = 'server-secret';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    for (const headers of [
      { host: 'n8n-host.example', 'x-forwarded-host': 'workflow.example', origin: 'https://workflow.example' },
      { host: 'workflow.example', origin: 'https://workflow.example', 'sec-fetch-site': 'same-site' },
      { host: 'workflow.example', origin: 'http://workflow.example' },
      { host: 'workflow.example', origin: 'https://workflow.example/path' },
    ]) {
      const { response, capture } = createResponse();
      await handler({ method: 'POST', headers, body: { workflowId: '42', payload: {} } }, response);
      expect(capture.statusCode).toBe(403);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
