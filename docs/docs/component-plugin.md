---
layout: docs
title: Component plugin - Merkur
---

# Component plugin

The component plugin is one of the base [Merkur]({{ '/' | relative_url }}) plugins which adds base lifecycle methods and properties to your widget. Other [Merkur plugins]({{ '/docs/plugins' | relative_url }}) can depend on it.

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

After that we have `info`, `load`, `bootstrap`,`mount`, `unmount`, `update`, `setState`, `setProps` async methods and `props`, `state`, `assets` properties available on widget.

## Properties

### props

The `props` property defines interface between Merkur widget and your application. It contains data from the application or server which are input for the widget. The data must be stringifiable. You can't directly mutate `props`, use [setProps]({{ '/docs/component-plugin#setprops' | relative_url }}) method instead.

### state

The `state` property contains current internal state of Merkur widget. The data must be stringifiable. You can't directly mutate `state`, use [setState]({{ '/docs/component-plugin#setstate' | relative_url }}) method instead.

### assets

The `assets` property contains important widget assets(css, js and others). The assets must be downloaded before widget can be created.

## Methods

All new available methods are asynchronous and we define their returning value in widget's code.

### info

The `info` method returns information about the widget such as name, version, props, state, assets, etc. It is primary useful for server-side rendering, where we need to collect important values for hydrating the widget in the browser.

```javascript
const { name, version, props, state, assets } = await widget.info();
```

### bootstrap

The `bootstrap` method is called only once before the widget loads its state and is mounted. We can connect other third-party code (services, listeners, etc) with the widget here.

### load

The `load` method is **mandatory** and returns current state of the widget. The load method is called before mounting the widget and after changing props.

### mount
The `mount` method is used for client and server environments. On server it has to return a string. On client it has to mount the widget to HTML and return promise that resolves after mounting the widget to DOM is completed.

### unmount
The `unmount` method is the opposite of the `mount` method. On server it's not used but on client it has to unmount the widget from HTML and return a promise that resolves after unmounting the widget from DOM is completed.

### update
The `update` method is called after changing widget state and it has to update DOM.

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