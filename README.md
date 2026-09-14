# WorkflowPro

WorkflowPro is a React/Vite workflow-operations prototype for presenting automation health, recent workflows, search/filtering, pagination, and integration concepts. The hardening branch now also contains a tested **n8n execution adapter contract**, but the UI is not yet wired to a durable server execution backend.

The repository should therefore be presented as a **code-ready workflow dashboard plus bounded provider-adapter prototype**, not as a finished automation platform.

## Implementation matrix

| Area | Status | Evidence |
| --- | --- | --- |
| Dashboard / workflow list UI | Implemented prototype | `src/` components and hooks |
| Search / filtering / sorting / pagination | Implemented | workflow UI hooks/components |
| Local workflow status updates / deletion | Implemented demo state | `src/hooks/useWorkflows.ts` |
| Integration cards | Demo state | `src/hooks/useIntegrations.ts` |
| Typed workflow step config | Implemented | `src/types/index.ts` |
| n8n provider adapter | Implemented/tested boundary | `src/services/workflowExecution.ts` |
| n8n config validation | Implemented | URL/API-key validation and HTTPS requirement |
| Provider timeout / sanitized failures | Implemented | bounded 15s execution request |
| Provider execution ID mapping | Implemented | successful response normalization |
| Deterministic CI | Implemented | Node 22, `npm ci`, tests, typecheck, lint, build |
| Production dependency audit | Verified clean in hardening pass | 0 vulnerabilities in the audit run used for the PR |
| Server endpoint / secret ownership | Pending | adapter is not yet exposed through a production server boundary |
| Durable workflows / run history | Pending | dashboard data remains local/demo |
| Live n8n integration smoke | Pending | no production n8n endpoint is claimed |
| Scheduling / webhooks / retries / idempotency | Pending | requires verified provider/runtime design |

## Current dashboard state

`src/hooks/useWorkflows.ts` initializes local demo workflows such as:

```text
Calendar Sync
Email Campaign Automation
Data Backup
Lead Generation
```

with statuses including `active`, `error`, and `paused`. Updates and deletion operate on local application state; refreshing the page does not provide durable workflow persistence.

## n8n execution boundary

`src/services/workflowExecution.ts` defines a narrow provider boundary for a selected n8n deployment. It currently verifies:

- a non-empty base URL and API key;
- HTTPS outside localhost/127.0.0.1 development;
- a non-empty workflow ID;
- POST execution to the provider path owned by the adapter;
- `X-N8N-API-KEY` ownership inside the adapter;
- a 15-second request timeout;
- normalized successful provider execution IDs;
- sanitized HTTP/network/timeout failures without provider-body or API-key leakage.

Tests were written against this boundary before its implementation and are part of the permanent CI gate.

This does **not** yet mean WorkflowPro has a live n8n integration. Before production use, the selected n8n deployment's exact endpoint/auth contract must be verified and the adapter must run behind a server-owned API/environment boundary so credentials never become browser configuration.

## Integration cards

The visible Make.com, n8n, and Google Calendar cards are still demo/product-concept state. They are not evidence of OAuth sessions or connected production accounts.

Do not describe these cards as live integrations until provider connection state is driven by real backend data.

## Intended execution flow

```text
workflow UI
    |
    v
server-owned WorkflowPro API
    |
    +-- workflow definitions
    +-- credentials / secret references
    +-- execution state
    +-- run history
    |
    v
provider adapters
    |
    +-- n8n  (first tested adapter contract)
    +-- Make.com
    +-- Google Calendar
    `-- other providers
```

The server-owned API/persistence layer is the next architectural boundary; it is intentionally not fabricated in this branch.

## Production requirements still open

A complete automation product still needs explicit behavior for:

- durable workflow definitions and versions;
- authenticated users/workspaces;
- server-side credential/OAuth storage;
- idempotency and retry policy;
- execution polling/webhook completion;
- execution logs and audit history;
- scheduling and trigger lifecycle;
- webhook signature verification;
- rate limits and quotas;
- partial-success/failure semantics;
- observability and hosted deployment smoke tests.

## Tech stack

- React 18
- TypeScript
- Vite 5
- Tailwind CSS
- Lucide React
- Vitest
- GitHub Actions

The n8n boundary uses standard `fetch`; no external automation-platform SDK is required for the current slice.

## Local development

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
```

## StackBlitz

```text
https://stackblitz.com/~/github.com/shikakker/WorkflowPro
```

## Current status

**Code-ready workflow-management dashboard prototype with a tested, bounded n8n provider-adapter contract.** Dashboard interaction remains local/demo state; server credential ownership, durable workflow/run storage, real provider execution, scheduling, authentication, and production deployment smoke tests remain explicit next gates.

## Product intent

WorkflowPro explores the operations layer around automation: users need to understand which workflows are healthy, what failed, what changed recently, and which external systems are connected. The engineering direction is to connect this UI to a server-owned execution/persistence model rather than adding more static integration cards.

## License

See repository files for licensing information.
