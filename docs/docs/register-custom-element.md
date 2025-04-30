---
layout: docs
title: Register Merkur widget as custom element
---

# Register Merkur widget as custom element

Merkur widgets can be registered as custom elements. This is useful for cases where SSR is not required. We assume that your widget is served as a single JavaScript file with defined assets.

## Installation

To easily register a Merkur widget as a custom element, use the `@merkur/integration-custom-element` module. This module is designed for client-side usage only.

```bash
npm i @merkur/integration-custom-element --save
```

## How to modify the default Merkur template

The default Merkur template is prepared for SSR. In the following sections, we will remove unnecessary parts and files to reconfigure the template for client-side usage only. First, create a new Merkur widget as described in [Getting started](https://merkur.js.org/docs/getting-started).

### Server part

After creating a new Merkur widget, update your playground template by creating the `/server/playground/templates/body.ejs` and `/server/playground/templates/footer.ejs` files. You can also run `merkur custom playground:body` and `merkur custom playground:footer` to generate these files. Then, modify the files as follows:

```javascript
// body.ejs
<{package.name}></{package-name}> // e.g., <merkur-widget></merkur-widget>
```

```javascript
// footer.ejs
// keep empty
```

This changes the logic for reviving the widget in the playground by adding only the custom element with the name from `package.json` to the body of the HTML. The custom element will automatically revive the Merkur widget. You can now remove other files in the `/server/*` folder.

### CLI configuration

Update the `merkur.config.mjs` file to include `@merkur/integration-custom-element/cli` in the `extends` field.

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function () {
  return {
    extends: ['@merkur/preact/cli', '@merkur/integration-custom-element/cli'],
  };
}
```

The `@merkur/integration-custom-element/cli` modifies the default `@merkur/cli` configuration by:
- Skipping `/widget` requests in the playground widget handler.
- Disabling the widget server (custom elements work only in the browser).
- Turning off HMR and enabling hot reload instead.
- Filtering out tasks for the Node.js platform.
- Forcing generated files to be saved to the filesystem (`writeToDisk = true`).
- Registering a CSS bundle plugin to include bundled CSS files in the JavaScript.

### Widget part

The default Merkur template uses the `config` npm module for resolving the application environment. However, the `config` module does not work in the browser. To address this, add support for application environments in the client solution with custom elements.

1. Create a new `config` folder in `/src/`.
2. Inside the `config` folder, create a file `/src/config/index.js` with the following code:

```javascript
import { deepMerge } from '@merkur/integration-custom-element';

import production from './production';
import development from './development';

let environment = null;
if (process.env.NODE_ENV === 'production') {
  environment = production;
} else {
  environment = deepMerge(production, development);
}

export { environment };
```

3. Create `production` and `development` environment files in `/src/config/production.js` and `/src/config/development.js`. For example, `/src/config/production.js`:

```javascript
export default {
  environment: 'production',
  cdn: 'http://localhost:4444',
  widget: {
    apiUrl: 'https://api.github.com/',
  },
};
```

4. Add the resolved environment to the widget's `props.environment` property in `/src/widget.js`. Since custom elements do not support Merkur slots, set `slotFactories` to an empty array. You can also remove the `src/components/slots` folder.

5. To inline the CSS bundle into the resulting JS file, add the following import and define an `inlineStyle` asset:

```javascript
import cssBundle from '@merkur/integration-custom-element/cssBundle';

assets: [
  {
    name: 'widget.css',
    type: 'inlineStyle',
    source: cssBundle,
  },
],
```

6. Finally, register your widget as a custom element using the `registerCustomElement` method:

```javascript
import { registerCustomElement } from '@merkur/integration-custom-element';

// ...existing code...

registerCustomElement({ widgetDefinition });
```

### Callbacks

The `registerCustomElement` method accepts a `callbacks` object that allows you to hook into the lifecycle of the custom element. These callbacks include:

- `constructor`: Called when the custom element is created.
- `connectedCallback`: Called when the custom element is added to the DOM.
- `disconnectedCallback`: Called when the custom element is removed from the DOM.
- `adoptedCallback`: Called when the custom element is moved to a new document.
- `attributeChangedCallback`: Called when an observed attribute changes.
- `mount`: Called when the widget is mounted.
- `remount`: Called when the widget is remounted.
- `getInstance`: Called to retrieve an existing widget instance.

Each callback receives the widget instance, the shadow DOM, and the custom element as arguments.

#### Example

Here is an example of how to use the `callbacks` object:

```javascript
import { registerCustomElement } from '@merkur/integration-custom-element';
import widgetDefinition from './widget';

registerCustomElement({
  widgetDefinition,
  callbacks: {
    constructor(widget, { shadow, customElement }) {
      console.log('Custom element created:', customElement);
    },
    connectedCallback(widget, { shadow, customElement }) {
      console.log('Custom element added to DOM:', customElement);
    },
    disconnectedCallback(widget, { shadow, customElement }) {
      console.log('Custom element removed from DOM:', customElement);
    },
    adoptedCallback(widget, { shadow, customElement }) {
      console.log('Custom element moved to a new document:', customElement);
    },
    attributeChangedCallback(widget, name, oldValue, newValue, { shadow, customElement }) {
      console.log(`Attribute "${name}" changed from "${oldValue}" to "${newValue}"`);
    },
    mount(widget, { shadow, customElement }) {
      console.log('Widget mounted:', widget);
    },
    remount(widget, { shadow, customElement }) {
      console.log('Widget remounted:', widget);
    },
    getInstance() {
      console.log('Retrieving existing widget instance');
      return null; // Return an existing widget instance if available
    },
  },
});
```

This example demonstrates how to log messages during each lifecycle event of the custom element. You can replace the `console.log` statements with your own logic to handle these events.

### `widget.root` and `widget.customElement`

- `widget.root`: Refers to the root DOM node where the widget is rendered. For custom elements, this is typically the shadow DOM of the element.
- `widget.customElement`: Refers to the custom element instance itself. This allows you to interact with the custom element directly from the widget.

These properties are automatically set when the widget is registered as a custom element and can be used to manage the widget's lifecycle or interact with the DOM.

### Default propagation of attributes to widget props

When a custom element is registered, its attributes are automatically propagated to the widget's `props` object. This allows you to configure the widget directly through the custom element's attributes in the HTML.

#### How it works

1. The `observedAttributes` property in the `registerCustomElement` options specifies which attributes the custom element observes. These attributes are automatically monitored for changes.
2. When an observed attribute changes, the `attributeChangedCallback` is triggered. This callback updates the corresponding property in the widget's `props` object.

#### Example

```javascript
import { registerCustomElement } from '@merkur/integration-custom-element';
import widgetDefinition from './widget';

registerCustomElement({
  widgetDefinition,
  observedAttributes: ['title', 'theme'], // Attributes to observe
});
```

In this example:
- The `observedAttributes` property specifies the attributes to observe (`title` and `theme`).
- The widget's `props` are automatically updated when the observed attributes change.