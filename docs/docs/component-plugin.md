---
layout: docs
title: Component plugin - Merkur
---

# Component plugin

The component plugin is one of the base [Merkur]({{ '/' | relative_url }}) plugins which adds base life cycle methods and properties to your widget. Other [Merkur plugins]({{ '/docs/plugins' | relative_url }}) can depend on it.

## Installation

We must add import for `componentPlugin` and register it to `$plugins` property of the widget.

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

After that we have `info`, `load`, `bootstrap`,`mount`, `unmount`, `update`, `setState`, `setProps` async methods and `props`, `state`, `assets` properties available on widget.

## Properties

### props

The `props` property defines interface between Merkur widget and you application. It contains data from the application or server which are input for the widget. The data must be stringify-able. You can't directly mutate `props` use [setProps]({{ '/docs/component-plugin#setprops' | relative_url }}) method instead.

### state

The `state` property contains current internal state of Merkur widget. The data must be stringify-able. You can't directly mutate `state` use [setState]({{ '/docs/component-plugin#setstate' | relative_url }}) method instead.

### assets

The `assets` property contains important widget assets(css, js and others). The assets must be downloaded before widget can be created.

## Methods

All new available methods are asynchronous and we define their returning value in widget's code.

### info

The `info` method returns information about widget as name, version, props, state, assets, etc. It's primary useful for server side where we need to collect important values for hydrating widget on the client side.

```javascript
const { name, version, props, state, assets } = await widget.info();
```

### bootstrap

The `bootstrap` method is called only once before the widget loads its state and is mounted. We can connect other third party code (services, listeners, etc) with widget here.

### load

The `load` method is **mandatory** and returns current state of widget. The load method is called before mounting the widget and after changing props.

### mount
The `mount` method is used for client and server environments. On server side it has to return a string. On client side it has to mount the widget to HTML and return promise that resolves after mounting the widget to DOM is completed.

### unmount
The `unmount` method is opposite for `mount` method. On server side is not useful but on client side it has to unmount the widget from HTML and return a promise that resolves after unmounting the widget from DOM is completed.

### update
The `udpate` method is called after changing widget state and it has to update DOM.

### setState
The `setState` method is for changing widget state. The method makes shallow copy of the state.

```javascript
console.log(widget.state); // { primitive: 1, object: { key: 'value'} };
await widget.setState({ object: { key: 'value2'} });
console.log(widget.state); // { primitive: 1, object: { key: 'value2'} };
```

### setProps
The `setProps` method is for changing widget props. The method makes shallow copy of the props.

```javascript
console.log(widget.props); // { pathname: '/'};
await widget.setProps({ pathname: '/detail/1'});
console.log(widget.props); // { pathname: '/detail/1' };
```