---
"@merkur/plugin-event-emitter": patch
---

Correct widget interface

- **What?** Change the type of the `widget` param of the event callback function from `WidgetInternal` to `Widget`.
- **Why?** `Widget` is what's passed in - its methods are already bound, i.e. don't expect `widget` as the first prop.  
- **How?** Nothing.