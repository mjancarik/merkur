---
"@merkur/core": patch
---

Fix the `widget` parameter type in `bindWidgetToFunctions` from `Widget` to `WidgetPartial`.

- **What** The `widget` parameter of `bindWidgetToFunctions()` in `@merkur/core` is now typed as `WidgetPartial` instead of `Widget`.
- **Why** `bindWidgetToFunctions` is called during plugin `setup()` and `create()` methods, which receive a `WidgetPartial` — the fully resolved `Widget` type is the result of the binding operation, not the input. The previous typing caused TypeScript errors when calling the function from those contexts.
- **How** Nothing.