import { executeN8nWorkflow } from '../../src/services/workflowExecution';

type RequestLike = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status(code: number): ResponseLike;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
};

function send(res: ResponseLike, status: number, body: unknown) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function firstHeader(req: RequestLike, name: string) {
  const raw = req.headers?.[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0] || '';
  return raw || '';
}

function requestIsSameOrigin(req: RequestLike) {
  const fetchSite = firstHeader(req, 'sec-fetch-site').trim().toLowerCase();
  if (fetchSite && fetchSite !== 'same-origin') return false;

  const origin = firstHeader(req, 'origin').trim();
  if (!origin) return process.env.NODE_ENV !== 'production';

  // Do not let untrusted X-Forwarded-Host redefine our own authority.
  const host = firstHeader(req, 'host').trim();
  if (!host || host.includes(',') || host.includes('@')) return false;

  try {
    const parsed = new URL(origin);
    const local = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
    return parsed.origin === origin
      && parsed.host.toLowerCase() === host.toLowerCase()
      && parsed.protocol === (local ? 'http:' : 'https:');
  } catch {
    return false;
  }
}

function parseRequest(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const input = body as Record<string, unknown>;
  const workflowId = typeof input.workflowId === 'string' ? input.workflowId.trim() : '';
  const payload = input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload)
    ? input.payload as Record<string, unknown>
    : {};

  if (!workflowId || workflowId.length > 200) return null;
  return { workflowId, payload };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Method not allowed' });
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.WORKFLOWPRO_ALLOW_PUBLIC_EXECUTION !== 'true'
  ) {
    return send(res, 503, { error: 'Workflow execution is disabled in production' });
  }

  if (!requestIsSameOrigin(req)) {
    return send(res, 403, { error: 'Cross-origin workflow execution is not allowed' });
  }

  const request = parseRequest(req.body);
  if (!request) {
    return send(res, 400, { error: 'A valid workflow id is required' });
  }

  // Public pilot mode must never let visitors execute arbitrary privileged
  // n8n workflows by guessing another valid ID. The operator owns this allowlist.
  if (process.env.NODE_ENV === 'production') {
    const permitted = new Set(
      (process.env.WORKFLOWPRO_ALLOWED_N8N_WORKFLOW_IDS || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean),
    );
    if (!permitted.has(request.workflowId)) {
      return send(res, 403, { error: 'Workflow is not approved for execution' });
    }
  }

  const baseUrl = process.env.N8N_BASE_URL?.trim() || '';
  const apiKey = process.env.N8N_API_KEY?.trim() || '';
  if (!baseUrl || !apiKey) {
    return send(res, 503, { error: 'Workflow execution is not configured' });
  }

  try {
    const result = await executeN8nWorkflow(request, { baseUrl, apiKey });
    return send(res, result.status === 'succeeded' ? 200 : 502, result);
  } catch {
    return send(res, 502, { status: 'failed', error: 'Workflow execution failed' });
  }
}
