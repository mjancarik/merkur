---
"@merkur/plugin-event-emitter": major
"@merkur/plugin-http-client": major
"@merkur/plugin-component": minor
---

Improve TypeScript type definitions in `plugin-component`, `plugin-event-emitter`, and `plugin-http-client`.

- **What** `setState` and `setProps` in `plugin-component` now accept updater functions and return `Promise<void>`; event callbacks in `plugin-event-emitter` now include the `widget` argument; `plugin-http-client` adds proper `HttpRequest`, `HttpTransformer`, and `HttpResult` interfaces and switches from the removed `HttpClientWidget` class to module augmentation.
- **Why** The previous types were inaccurate or incomplete, causing TypeScript errors when passing updater functions to `setState`/`setProps`, missing the `widget` parameter in event callbacks, and lacking proper interfaces for HTTP client operations.
- **How** Nothing.