---
"@merkur/plugin-validation": patch
---

  - **What** Fixed the TypeScript declarations in `types.d.ts` so the documented usage type-checks with no casts under `strict` mode. `validationPlugin(options)` now correctly returns a plugin factory `() => WidgetPlugin` (matching the runtime) instead of `WidgetPlugin`, and `Schema.safeParse` is declared as a method with trailing args so real schema libraries (`@esmj/schema`, `zod`, `valibot`, ...) satisfy the `Schema` interface.
  - **Why** The published types didn't match the runtime, forcing consumers to add `as unknown as ...` casts when wiring the plugin into `$plugins` or passing a real schema, because `$plugins` expects `() => WidgetPlugin` and `safeParse` was checked contravariantly as a property under `strictFunctionTypes`.
  - **How** Nothing.

