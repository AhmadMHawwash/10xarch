# SG-004: C4 renderer (L2/L3) + depth/filter/evidence + export

Status: todo | Estimate: L | Owner: TBD
Epic: EPIC-001

## Description
Build UI to render containers and components with a depth slider, filters (edge type, external/internal), search, evidence popovers, and export to PNG/SVG/JSON.

## Deliverables
- React components for L2/L3 views.
- Depth slider and filters; search; evidence popovers.
- Export functions (PNG/SVG/JSON).

## Acceptance Criteria
- Large graphs remain usable (capped fanout, virtualization if needed).
- Clicking edge shows evidence; click-to-code opens file+line.

## Test Plan
- UI snapshot tests; manual smoke on sample large graphs.

## Dependencies
- SG-003.


