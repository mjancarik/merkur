---
"@merkur/cli": minor
---

Added the ability to statically deploy a playground for a Merkur widget with a server

- **What** Added the ability to integrate the Merkur widget on the client side to `footer.js` (playground), which is used for when bulding static playground for Merkur widget. Remove control check if Merkur widget server is live when building static playground, because the widget server is called on a client. Added `apiRoute` into `merkurConfig.widgetServer` to centralize the widget api endpoint name. Added `relativeUrlDefault` into `merkurConfig.playground` for easier orientation when starting `npm run dev`, you can see on which url is the working version of your Merkur playground. Added `widgetParamsClient` into `merkurConfig.playground` which is a function that builds the widget params for widgetAPI, that is used when integrating the Merkur widget with a static playground. Added `deployedWidgetUrl` into `merkurConfig.widgetServer` when static playground with server is build, which is the url where widget server running and it is used for calling widget server on client side in static playground.
- **Why** For the possibility to generate a static playground for the Merkur widget.
- **How** Nothing.
