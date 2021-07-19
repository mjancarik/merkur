---
layout: docs
title: Style Inhibitor plugin - Merkur
---

# Style Inhibitor plugin

The style inhibitor plugin inhibits css rules inherited from outside of root element (`containerSelector`). It reset's all affected css properties to the values defined in widget stylesheet or default CSS value.

## Installation

We must add import of `styleInhibitorPlugin` and register it to `$plugins` property of the widget.

```javascript
// ./src/widget.js
import { styleInhibitorPlugin } from '@merkur/plugin-style-inhibitor';

export const widgetProperties = {
  name,
  version,
  $plugins: [styleInhibitorPlugin],
  // ... other properties
};
```

> ### Note! For style inhibitor to work correctly in CORS affected environment you need to define all of you stylesheets as `inlineStyle`.


```javascript
export const widgetProperties = {
    // ...
    $plugins: [
        // ...
        styleInhibitorPlugin,
    ],
    assets: [
        // ...
        {
            name: 'style.css',
            type: 'inlineStyle',
        }
    ],
};
```

After that when widget is mounted on client side the plugin traverses through all `document.styleSheets` to find those css rules that affect elements nested in root element. For each found css definition it creates counteracting definition based on widget stylesheet or default CSS definition.
