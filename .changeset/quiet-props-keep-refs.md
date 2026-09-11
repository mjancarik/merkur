---
"@merkur/plugin-validation": patch
---

- **What** `setProps()` now keeps the references of props it did not touch. The validated/transformed data from the schema's `safeParse()` is applied only to the props passed to the current `setProps()` call; all other props are carried over from the previous `widget.props` by reference. Props stripped by the schema are not restored, and a props setter function returning `null`/`undefined` is handled as an empty update.
- **Why** Schemas rebuild the whole object tree in `safeParse()`, so replacing `widget.props` with its full output handed out new references for every prop on each `setProps()` call, even for props that did not change. Consumers comparing props by reference (e.g. Preact effect dependencies or a "is this still the same source" check) saw a change that never happened and rerendered or reloaded needlessly. Untouched props were already validated on mount or by an earlier `setProps()`, so revalidating them adds nothing.
- **How** Nothing.