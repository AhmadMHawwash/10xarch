# CG-001: GitHub App setup & webhooks

Status: todo | Estimate: M | Owner: TBD
Epic: EPIC-002

## Description
Create GitHub App with required permissions and webhook handling for `pull_request` and `push` events. Enqueue jobs per event.

## Deliverables
- App manifest; permission scopes; secret management.
- Webhook server; job queue integration.

## Acceptance Criteria
- App can be installed on test org; events received and enqueued.

## Dependencies
- None (infrastructure).


