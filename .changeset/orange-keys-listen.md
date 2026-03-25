---
"@merkur/core": patch
---

Type change

- **What?** Change type for attribute `widget` of function `bindWidgetToFunctions()`. 
- **Why?** Since this function takes current widget and binds that to functions (by default on the widget itself, optionally on any supplied object), *it has to be type `WidgetPartial`. The type `Widget` is the result of this operation. As currently typed, it doesn't work in plugin `setup()` and `create()` methods, because those get `WidgetPartial` as input attrs.
- **How?** Nothing.