---
"@merkur/plugin-component": patch
---

Fix `setState` is not executed if the widget is not mounted.

- **What** `setState` method is not executed if the widget is not mounted.
- **Why** The `setState` method should only be called on a mounted widget. If the widget is not yet mounted, and we want to change the state, we change it using the return value of the `load` method instead.
- **How** Nothing.
