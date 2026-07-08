---
"@merkur/plugin-component": minor
---

Added a teardown lifecycle method as the counterpart to bootstrap.

- New method teardown(widget) — called automatically at the end of widget.unmount(), after the unmount lifecycle step. Use it to remove event listeners or disconnect third-party integrations that were registered in bootstrap.
- The full widget lifecycle order is now: bootstrap → load → mount → (active) → unmount → teardown
- teardown is optional — if not defined, unmount() continues silently with no error.
- TypeScript: added teardown? to WidgetDefinition and RequiredWidgetKeys in types.d.ts.
