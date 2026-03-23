---
"@merkur/create-widget": patch
---

Fix vanilla ErrorView template to use correct HTML attribute and prevent XSS.

- **What** The generated `ErrorView` template in the vanilla widget scaffold used the JSX attribute `className` instead of the HTML attribute `class`, causing the CSS class to be silently dropped. Additionally, interpolated values (`status`, `message`, `stack`) were injected raw into the HTML string, opening a cross-site scripting (XSS) vulnerability.
- **Why** Vanilla templates are plain HTML strings — not JSX — so `className` is not interpreted. Raw interpolation of untrusted error data (e.g. a server-side message) could allow script injection in any app that renders the error view.
- **How** Nothing.
