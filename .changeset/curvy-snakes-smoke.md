---
"@merkur/plugin-event-emitter": major
"@merkur/plugin-http-client": major
"@merkur/plugin-component": minor
---

- **What?** Improved TypeScript type definitions across `plugin-component`, `plugin-event-emitter`, and `plugin-http-client`.
- **Why?** The previous types were inaccurate or incomplete — `setState`/`setProps` didn't allow updater functions and were missing the `Promise<void>` return; event callbacks were missing the `widget` argument; `plugin-http-client` lacked proper interfaces for `HttpRequest`, `HttpTransformer`, and `HttpResult`, and used a now-removed `HttpClientWidget` class instead of module augmentation.
- **How?** nothing