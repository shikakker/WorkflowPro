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
  if (fetchSite === 'cross-site') return false;

  const origin = firstHeader(req, 'origin').trim();
  if (!origin) return process.env.NODE_ENV !== 'production';

  const forwardedHost = firstHeader(req, 'x-forwarded-host').split(',', 1)[0].trim();
  const host = forwardedHost || firstHeader(req, 'host').trim();
  if (!host) return false;

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
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
