# WorkflowPro

WorkflowPro is a React/Vite workflow-operations prototype with a real server-owned execution boundary for n8n. The current hardening branch supports browser-local workflow management, guarded **Run now** execution through a same-origin API, recoverable local execution history, and dashboard metrics derived from recorded runs.

It is not yet a multi-user production automation platform: workflow definitions and execution history are still stored in the browser, and a real n8n deployment plus authenticated durable backend are required before production use.

## Core flow

```text
Create workflow
  |
  | optional n8n workflow ID
  v
Activate workflow
  |
  v
Run now
  |
  v
POST /api/workflows/execute
  |
  | server-only N8N_BASE_URL / N8N_API_KEY
  v
n8n adapter
  |
  v
sanitized succeeded / failed result
  |
  v
local execution history + dashboard metrics
```

Provider credentials are never accepted from the browser and are not stored in workflow records.

## What works

- create, pause/activate, filter, sort and delete local workflows;
- persist validated workflow definitions in versioned browser storage;
- bind an optional n8n workflow ID to a workflow definition;
- execute active/provider-bound workflows through the same-origin server API;
- prevent duplicate concurrent runs for the same workflow in the current client session;
- recover runs left `running` across a reload as interrupted failures instead of leaving infinite loading state;
- persist a bounded local history of the newest 100 executions;
- show truthful execution totals and success/failure rate from recorded history;
- validate workflow IDs and provider configuration server-side;
- require HTTPS for non-local n8n endpoints;
- enforce a 15-second provider timeout and sanitized errors;
- keep server responses `no-store` and avoid leaking provider bodies or API keys;
- fail cleanly on browser/server network errors.

The Make.com, n8n and Google Calendar integration cards remain product/demo surfaces; they are not claims of active OAuth connections.

## Current product boundary

Workflow definitions and run history use browser `localStorage`. That makes the current release useful as a verifiable single-browser prototype, but it does **not** provide:

- authenticated users or workspaces;
- shared/multi-device workflow state;
- server-durable execution history;
- provider job polling/webhook reconciliation;
- retries/backoff or idempotent job orchestration;
- scheduling/trigger lifecycle;
- production observability or audit logs;
- verified live n8n execution without real server credentials.

Those capabilities should be implemented on a durable authenticated backend rather than simulated in client state.

## n8n server configuration

Copy the safe template and provide real values only in the server environment:

```bash
cp .env.example .env
```

Required server variables:

```text
N8N_BASE_URL=https://your-n8n.example.com
N8N_API_KEY=...
```

Never expose the API key through `VITE_*` variables or browser code.

The selected n8n deployment's exact execution endpoint/auth semantics must still be verified against the real provider before production promotion.

## Stack

- React 18
- TypeScript
- Vite 8.3.0
- Tailwind CSS
- Lucide React
- Vitest 5.0.1
- ESLint 9 compatibility line with zero-warning CI
- GitHub Actions on Node 22
- Vercel-style server function under `api/workflows/execute.ts`

## Development

Requirements: Node.js 22 and npm.

```bash
git clone https://github.com/shikakker/WorkflowPro.git
cd WorkflowPro
npm ci
npm run dev
```

Verification:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

Or run the local code checks together:

```bash
npm run check
```

Permanent GitHub CI is read-only and blocks on clean install, production audit, full dependency audit, tests, typecheck, zero-warning lint and production build.

## Deployment

The connected Vercel team currently exposes no project named `WorkflowPro`, `workflowpro` or `workflow-pro`, so this branch does not claim an exact-head hosted preview. A canonical Vercel project must be linked before browser/runtime verification can be completed.

A plain static Vite host is not sufficient for the complete execution flow because `/api/workflows/execute` requires a server/serverless runtime with access to the server-only n8n environment variables.

## Product intent

WorkflowPro explores the operations layer around automation: users need to see what workflows exist, run a configured workflow without exposing provider credentials, understand whether it succeeded, and recover from failures. The next architectural step is durable authenticated server storage and a verified provider job lifecycle, not more simulated integration cards.
