# WorkflowPro — Modernization Roadmap

The repository currently implements the automation-management UX with local workflow and integration state. It does not execute workflows or connect to n8n, Make.com or Google Calendar.

## 10 tasks
1. Define typed workflow, trigger, step, integration, credential-reference and run-history domain models.
2. Separate workflow-definition UI from execution-provider adapters.
3. Build a real create/edit workflow flow before presenting the New Workflow CTA as functional.
4. Add a backend persistence layer for workflow definitions, statuses and run history.
5. Store integration credentials server-side with encryption/secret-management rather than in browser state.
6. Implement one integration end-to-end first (for example n8n) before expanding the integration catalog.
7. Add webhook/event idempotency, retry policy and observable execution states for real runs.
8. Add tests for filtering/pagination/status mutations plus future workflow-builder validation and provider errors.
9. Add CI/build/accessibility validation and capture operational UX states with realistic failure examples.
10. Package as an automation-control-plane product case, explicitly separating current frontend UX from future execution infrastructure.

## Portfolio value
Strong B2B SaaS/product-design case; high Product Engineer potential after one real provider and execution lifecycle are implemented.