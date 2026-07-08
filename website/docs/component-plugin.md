---
sidebar_position: 10
title: Component Plugin
description: Learn about the Component plugin - one of Merkur's base plugins
---

# Component plugin

The component plugin is one of the base [Merkur](/) plugins which adds base lifecycle methods and properties to your widget. Other [Merkur plugins](/docs/plugins) can depend on it.

## Installation

We must add import of `componentPlugin` and register it to the `$plugins` property of the widget.

```javascript
// ./src/widget.js
import { componentPlugin } from '@merkur/plugin-component';

export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  // ... other properties
};

```

After that we have `info`, `load`, `bootstrap`, `teardown`, `mount`, `unmount`, `update`, `setState`, `setProps` async methods and `props`, `state`, `assets` properties available on widget.

## Properties

### props

The `props` property defines interface between Merkur widget and your application. It contains data from the application or server which are input for the widget. The data must be stringifiable. You can't directly mutate `props`, use [setProps](/docs/component-plugin#setprops) method instead.

### state

The `state` property contains current internal state of Merkur widget. The data must be stringifiable. You can't directly mutate `state`, use [setState](/docs/component-plugin#setstate) method instead.

### assets

The `assets` property contains important widget assets(css, js and others). The assets must be downloaded before widget can be created.

## Methods

All new available methods are asynchronous and we define their returning value in widget's code.

### info

The `info` method returns information about the widget such as name, version, props, state, assets, containerSelector, etc. It is primary useful for server-side rendering, where we need to collect important values for hydrating the widget in the browser.

```javascript
const { name, version, props, state, assets, containerSelector } = await widget.info();
```

### bootstrap

The `bootstrap` method is called only once before the widget loads its state and is mounted. We can connect other third-party code (services, listeners, etc) with the widget here.

```javascript
export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  bootstrap(widget) {
    widget.$dependencies.emitter.on('change', widget.$dependencies.handleChange);
  },
};
```

You can also perform async operations in `bootstrap`, for example initialising a third-party SDK before the widget loads:

```javascript
export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  async bootstrap(widget) {
    await widget.$dependencies.analyticsSDK.init({ appId: widget.props.appId });
  },
};
```

### teardown

The `teardown` method is the counterpart to `bootstrap`. It is called automatically once after the widget is unmounted from the DOM. Use it to remove event listeners or disconnect any third-party integrations that were registered in `bootstrap`.

```javascript
export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  bootstrap(widget) {
    widget.$dependencies.emitter.on('change', widget.$dependencies.handleChange);
  },
  teardown(widget) {
    widget.$dependencies.emitter.off('change', widget.$dependencies.handleChange);
  },
};
```

The execution order during the widget lifecycle is:

1. `bootstrap` → `load` → `mount`
2. *(widget is active)*
3. `unmount` → `teardown`

### load

The `load` method is **mandatory** and returns current state of the widget. The load method is called before mounting the widget and after changing props.

While `load` is in progress, `$in.component.loadingPromise` holds a reference to the pending Promise. Any `setState` calls made during this time will automatically await the `loadingPromise` before applying, ensuring the state set by `load` is never overwritten by concurrent `setState` calls. Once `load` completes, `loadingPromise` is reset to `null`.

```javascript
export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  async load(widget) {
    const data = await widget.http.request({ path: '/api/items' });
    return { items: data.response.body };
  },
};
```

### mount

The `mount` method is used for client and server environments. On the server it must return an HTML string. On the client it mounts the widget into the DOM and returns a promise that resolves when mounting is complete.

```javascript
export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  async mount(widget) {
    const { View } = await widget.$dependencies.viewFactory(widget);
    return View(widget);
  },
};
```

### unmount

The `unmount` method is the opposite of the `mount` method. On the server it is not used. On the client it must unmount the widget from the DOM and return a promise that resolves when unmounting is complete.

```javascript
export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  async unmount(widget) {
    widget.$dependencies.renderer.unmount(widget.container);
  },
};
```

### update

The `update` method is called after changing widget state or props and must update the DOM to reflect the new state.

```javascript
export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin],
  async update(widget) {
    const { View } = await widget.$dependencies.viewFactory(widget);
    widget.$dependencies.renderer.update(widget.container, View(widget));
  },
};
```

### setState
The `setState` method is for changing widget state. The method makes shallow copy of the state.

```javascript
console.log(widget.state); // { primitive: 1, object: { key: 'value'} };
await widget.setState({ object: { key: 'value2'} });
console.log(widget.state); // { primitive: 1, object: { key: 'value2'} };
```

You can also pass a **callback function** that receives the current state and returns the partial state to merge. This is useful when the new state depends on the previous value:

```javascript
await widget.setState((state) => ({ count: state.count + 1 }));
```

If `setState` is called while the [`load`](/docs/component-plugin#load) method is still running, the call automatically **waits** for `load` to finish before applying the state change. This guarantees that state updates are never lost and are always applied after the widget state is fully initialized.

### setProps
The `setProps` method is for changing widget props. The method makes shallow copy of the props.

```javascript
console.log(widget.props); // { pathname: '/'};
await widget.setProps({ pathname: '/detail/1'});
console.log(widget.props); // { pathname: '/detail/1' };
```
