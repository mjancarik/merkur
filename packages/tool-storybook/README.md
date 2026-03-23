# Merkur - tool-storybook

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/tool-storybook/latest.svg)](https://www.npmjs.com/package/@merkur/tool-storybook)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/tool-storybook/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

The module enables integration of [Storybook](https://storybook.js.org/) into [Merkur](https://merkur.js.org/).

**[Full documentation](https://merkur.js.org/docs/storybook-integration-into-merkur).**

## API

### `createPreviewConfig(options)`

Registers a Merkur widget with Merkur's factory and returns a partial Storybook `preview.mjs` configuration (`{ loaders }`). Spread the result into your preview export.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `widgetProperties` | `Object` | ✅ | Widget definition object — must include `name` and `version`. |
| `render` | `Function` | — | Called each time the widget's update lifecycle fires, receives the widget instance. Defaults to a no-op. |
| `createWidget` | `Function` | — | Widget factory function. Defaults to `createMerkurWidget` from `@merkur/core`. |

```javascript
import { createPreviewConfig } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';

export default {
  ...createPreviewConfig({ widgetProperties, render: myRenderCallback }),
};
```

### `createVanillaRenderer(options)`

Creates a `render` / `update` pair for vanilla JavaScript widgets that produce HTML strings. Pass `render` as the Storybook story render function and `render: renderer.update` to `createPreviewConfig` so state changes trigger re-renders.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `ViewComponent` | `Function \| Object<string, Function>` | ✅ | A single view function `(widget) => htmlString`, or a named map with a `"default"` key. |
| `bindEvents` | `Function` | — | Called after every render: `(container, widget) => void`. Falls back to `widget.View.bindEvents` if present. |

```javascript
import { createPreviewConfig, createVanillaRenderer } from '@merkur/tool-storybook';
import widgetProperties from '../src/widget.js';

const renderer = createVanillaRenderer({
  ViewComponent: { default: (widget) => `<div>${widget.state.counter}</div>` },
  bindEvents(container, widget) {
    container.querySelector('button')?.addEventListener('click', widget.onClick);
  },
});

export default {
  ...createPreviewConfig({ widgetProperties, render: renderer.update }),
  render: renderer.render,
};
```

### `createWidgetLoader(options)`

Low-level factory that returns a single Storybook loader function. `createPreviewConfig` uses this internally. Use it directly when you need more control over widget registration.

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `widgetProperties` | `Object` | ✅ | Widget definition object — must include `name` and `version`. |
| `render` | `Function` | — | Render callback invoked on widget updates. Defaults to a no-op. |

## About Merkur

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices. It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of four predefined template's library [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) and [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) but you can easily extend for others.
