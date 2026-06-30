---
"@merkur/cli": minor
---

Added the ability to statically deploy a playground for a Merkur widget with a server

- **What** Added `apiRoute` into `merkurConfig.widgetServer` to centralize the widget api endpoint name. Added `relativeUrlDefault` and `widgetParamsDefault` into `merkurConfig.playground` for easier orientation when starting `npm run dev`, you can see on which url is the working version of your Merkur playground. Static playground can now be used for a widget server.
- **Why** For the possibility to generate a static playground for the Merkur widget.
- **How** Nothing.
