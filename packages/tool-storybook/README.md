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
| `createVanillaRenderer()` | Creates a `render`/`update` pair for vanilla JS widgets that produce HTML strings. |
| `createWidgetLoader(options)` | Low-level loader factory used internally by `createPreviewConfig`. Use directly when you need full control over widget registration. |

### `createPreviewConfig` options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `widgetProperties` | `Object` | ✅ | Widget definition object — must include `name` and `version`. |
| `render` | `Function` | — | Called each time `widget.update()` fires, receives the widget instance. Defaults to a no-op. |
| `createWidget` | `Function` | — | Widget factory. Defaults to `createMerkurWidget` from `@merkur/core`. |

### `createVanillaRenderer`

`createVanillaRenderer()` takes no arguments.

- Stories must provide `args.component` as a function `(widget) => htmlString`.
- Event binding: attach a `bindEventListeners(widget, container)` function to `args.component`. The idiomatic place is `View.js` itself — `View.bindEventListeners = bindEventListeners` — so any story that passes `component: View` gets it automatically. A decorator can inject it for component stories that don't carry it already.
- **Security:** `args.component` is responsible for HTML-escaping any dynamic values before returning the HTML string. Raw interpolation of user-controlled strings is injected via `innerHTML` as-is.

### Peer dependencies

This package requires **Storybook ≥ 10** (`storybook/preview-api` and `storybook/internal/core-events` are imported at runtime). Installing it alongside Storybook < 10 will cause a module-not-found error.

## About Merkur

[Merkur](https://merkur.js.org/) is a tiny extensible JavaScript library for front-end microservices. It supports server-side rendering out of the box and works with [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/), vanilla JS, and more.
