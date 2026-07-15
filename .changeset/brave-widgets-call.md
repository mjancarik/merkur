---
"@merkur/integration-custom-element": minor
---

Add a `methods` option to `registerCustomElement` for exposing widget-delegating methods on the custom element.

- **What** New optional `methods` option in `registerCustomElement(options)`. Each entry becomes a public method on the custom element that is available as soon as the element is upgraded; when called it waits until the widget is created and then invokes the handler as `handler(widget, ...args)`, returning its result as a promise. Method names that collide with an existing element member (lifecycle callbacks, internal helpers or native `HTMLElement` members) are skipped with a `console.error`.
- **Why** It offers a declarative, encapsulated way to expose imperative methods that delegate to the widget and automatically wait for it, so callers can invoke them at any time without wiring up readiness handling themselves.
- **How** Nothing.
