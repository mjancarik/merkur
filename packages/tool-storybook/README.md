# Merkur - tool-storybook

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/tool-storybook/latest.svg)](https://www.npmjs.com/package/@merkur/tool-storybook)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/tool-storybook/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Integrates [Storybook](https://storybook.js.org/) with [Merkur](https://merkur.js.org/) widgets. The package handles the widget lifecycle (create → mount → unmount) inside the Storybook loader pipeline, so your story files stay focused on rendering.

**[Full documentation and setup guide](https://merkur.js.org/docs/storybook-integration-into-merkur).**

## Installation

```bash
npm install --save-dev @merkur/tool-storybook
```

## API

| Export | Description |
|--------|-------------|
| `createPreviewConfig(options)` | Registers a widget with Merkur and returns a partial Storybook `preview.mjs` config (`{ loaders }`). Spread into your preview export. |
| `createVanillaRenderer(options)` | Creates a `render`/`update` pair for vanilla JS widgets that produce HTML strings. |
| `createWidgetLoader(options)` | Low-level loader factory used internally by `createPreviewConfig`. Use directly when you need full control over widget registration. |

### `createPreviewConfig` options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `widgetProperties` | `Object` | ✅ | Widget definition object — must include `name` and `version`. |
| `render` | `Function` | — | Called each time `widget.update()` fires, receives the widget instance. Defaults to a no-op. |
| `createWidget` | `Function` | — | Widget factory. Defaults to `createMerkurWidget` from `@merkur/core`. |

### `createVanillaRenderer` options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `ViewComponent` | `Function \| Object<string, Function>` | ✅ | A single view function `(widget) => htmlString`, or a named map where `"default"` is the fallback. Use `args.component` (function or string key) in story args to select a view. |
| `bindEvents` | `Function` | — | Called after every render: `(container, widget) => void`. Falls back to `widget.View.bindEvents` when omitted. |

## About Merkur

[Merkur](https://merkur.js.org/) is a tiny extensible JavaScript library for front-end microservices. It supports server-side rendering out of the box and works with [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/), vanilla JS, and more.
