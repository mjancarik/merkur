---
sidebar_position: 17
title: Session Storage Plugin
description: Learn about the Session Storage plugin for managing browser session storage in Merkur
---

# Session Storage plugin

The Session Storage plugin adds `sessionStorage` property to your widget with a `get`, `set` and `delete` methods. Under the hood this plugin uses native [`window.sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage). On the server side these methods do nothing.

## Installation

We must add import of `sessionStoragePlugin` and register it to `$plugins` property of the widget.

```javascript
// ./src/widget.js
import { sessionStoragePlugin } from '@merkur/plugin-session-storage';

export const widgetProperties = {
  name,
  version,
  $plugins: [sessionStoragePlugin],
  // ... other properties
};

// ./src/polyfill.js
import 'whatwg-fetch';
import 'abort-controller/polyfill';
```

After that we have an `sessionStorage.get(key)`, `sessionStorage.set(key, value)` and `sessionStorage.delete(key)` methods available on the widget.

All data item keys are internally prefixed with a key prefix, which we can override with `setKeyPrefix(widget, additionalWords = [], defaultWords = ['widget', widget.name, widget.version])` method from `@merkur/plugin-session-storage`.

```javascript
// ./src/widget.js
import { setKeyPrefix } from '@merkur/plugin-session-storage';

const year = 2023;

export const widgetProperties = {
  name: 'my-widget',
  version: '1.0.0',
  bootstrap(widget) {
    setKeyPrefix(widget, [year]);
  }
};
```

With this configuration all data item keys will be prefixed with `__widget__my-widget__1.0.0__2023__`. If you don't use
`setKeyPrefix()` to override the default configuration, all data item keys will be prefixed with `__widget__my-widget__1.0.0__`.

## Methods

### `get` and `set`

- `key` - string
- `value` - * (only present on `set` method)

The `get` method returns a data item value, which is stored under the `key`. Method `set` saves a data item value under the `key`. In the native `window.sessionStorage` all keys are internally prefixed with a key prefix, which can be the default or overriden with `setKeyPrefix()`.

```javascript
widget.sessionStorage.set('item1', 'value1');
const item1 = widget.sessionStorage.get('item1');

console.log(item1); // value1
```

### `delete`
- `key` - string

The `delete` method deletes a data item value, which is stored under the `key`.

```javascript
widget.sessionStorage.set('item1', 'value1');
widget.sessionStorage.delete('item1');
const item1 = widget.sessionStorage.get('item1');

console.log(item1); // undefined
```
