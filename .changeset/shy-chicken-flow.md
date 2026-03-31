---
"@merkur/create-widget": patch
---

Escape HTML output in vanilla template to prevent XSS

- **What** Added `escHtml()` calls around all widget state and property values interpolated into template literals in `Counter.js`, `WidgetDescription.js`, `HeadlineSlot.js`, and `ErrorView.js`. Also fixed `className` to `class` in `ErrorView.js`.
- **Why** Raw interpolation of widget state into HTML strings is vulnerable to XSS. Any user-controlled value (e.g. `widget.state.counter`, `widget.name`, `widget.error.message`) could inject arbitrary HTML.
- **How** Nothing.

