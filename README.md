# WorkflowPro

Workflow-automation dashboard **frontend prototype** for presenting automation status, recent workflows, search / filtering, pagination, and integration cards for tools such as Make.com, n8n, and Google Calendar.

The current repository is a React / Vite UI prototype using local component state. It does **not** connect to Make.com, n8n, Google Calendar, or a workflow-execution backend in the audited code path.

## Product areas

- Dashboard overview
- Workflow statistics
- Recent-workflow list
- Workflow search
- Status filtering
- Sorting
- Pagination
- Status updates
- Workflow deletion
- Integration cards
- Sidebar / layout shell
- New-workflow CTA

## Current workflow state

`src/hooks/useWorkflows.ts` initializes local demo workflows such as:

```text
Calendar Sync
Email Campaign Automation
Data Backup
Lead Generation
```

with statuses including:

```text
active
error
paused
```

Updates and deletion operate only on React state.

Refreshing the page resets the current workflow list unless another persistence layer is added.

## “New Workflow” boundary

The dashboard displays a prominent **New Workflow** button, and `useWorkflows()` includes an `addWorkflow()` helper, but the current top-level dashboard button is not shown wired to a complete workflow-builder / save flow in the audited application path.

Do not describe this repository as a functioning automation builder or execution engine without validating that end-to-end creation flow.

## Integration cards are demo state

`useIntegrations.ts` currently defines local records for:

```text
Make.com
n8n
Google Calendar
```

with statuses such as:

```text
Connected
5 minutes ago
10 minutes ago
1 hour ago
```

Those values are hard-coded UI state.

The package contains no Make.com SDK, n8n API client, Google Calendar OAuth integration, backend credential store, or webhook infrastructure.

Therefore the current integration cards are **product concepts**, not live connections.

## Intended architecture

A real WorkflowPro backend could separate workflow definition from execution:

```text
workflow UI
    |
    v
workflow API / database
    |
    +-- trigger definition
    +-- step graph
    +-- credentials / secrets
    +-- execution status
    +-- run history
    |
    v
integration adapters
    |
    +-- n8n
    +-- Make.com
    +-- Google Calendar
    `-- other services
```

## Workflow-engine requirements

A production automation product would need explicit behavior for:

- durable workflow definitions;
- trigger configuration;
- action configuration;
- credentials / OAuth;
- secret isolation;
- retries;
- idempotency;
- execution logs;
- timeouts;
- rate limits;
- scheduling;
- webhook verification;
- step dependencies;
- failure / partial-success behavior;
- versioning;
- audit history.

None of those runtime semantics should be inferred from dashboard status cards alone.

## Tech stack

- React 18
- TypeScript
- Vite 5
- Tailwind CSS
- Lucide React

The current package intentionally remains small and contains no external automation-platform SDKs.

## Local development

### Requirements

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/shikakker/WorkflowPro.git
cd WorkflowPro
npm install
```

Run:

```bash
npm run dev
```

Build / lint / preview:

```bash
npm run lint
npm run build
npm run preview
```

## StackBlitz

```text
https://stackblitz.com/~/github.com/shikakker/WorkflowPro
```

## Current status

**Functional workflow-management dashboard prototype using local demo state.** Search, filters, sorting, pagination, workflow status changes, deletion, stats, and integration presentation are implemented. Persistent workflows, real integrations, authentication, execution, scheduling, and automation credentials are not represented by the current repository.

## Product intent

The project explores the operations layer around automation: users need a fast way to understand which workflows are healthy, which are failing, what changed recently, and which external systems are connected. The next engineering step is connecting the UI to a durable workflow / execution model rather than adding more static integration cards.

## License

See repository files for licensing information.