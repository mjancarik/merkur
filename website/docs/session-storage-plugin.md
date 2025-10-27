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
```

After that we have an `sessionStorage.get(key)`, `sessionStorage.set(key, value, options)` and `sessionStorage.delete(key)` methods available on the widget.

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
- `options` - object (optional, only present on `set` method)
  - `ttl` - number (optional) - Time-to-live in milliseconds after which the value should be automatically removed

The `get` method returns a data item value, which is stored under the `key`. Method `set` saves a data item value under the `key`. In the native `window.sessionStorage` all keys are internally prefixed with a key prefix, which can be the default or overriden with `setKeyPrefix()`.

```javascript
widget.sessionStorage.set('item1', 'value1');
const item1 = widget.sessionStorage.get('item1');

console.log(item1); // value1
```

#### TTL (Time-To-Live)

You can set an expiration time for stored values using the `ttl` option. The value is specified in milliseconds and represents how long the item should remain valid after being stored.

```javascript
// Store a value that expires after 5 minutes (300000 milliseconds)
widget.sessionStorage.set('temporaryItem', 'value', { ttl: 300000 });

// The item is available immediately
console.log(widget.sessionStorage.get('temporaryItem')); // 'value'

// After 5 minutes, the item is automatically deleted and returns undefined
setTimeout(() => {
  console.log(widget.sessionStorage.get('temporaryItem')); // undefined
}, 300000);
```

When you try to get an expired item, it is automatically removed from storage and `undefined` is returned. Items with `ttl: 0` or negative values are immediately deleted when set.

```javascript
// This item is deleted immediately
widget.sessionStorage.set('immediateDelete', 'value', { ttl: 0 });
console.log(widget.sessionStorage.get('immediateDelete')); // undefined
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
