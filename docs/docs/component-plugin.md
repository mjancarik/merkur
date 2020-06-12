---
layout: docs
title: Component plugin - Merkur
---

# Component plugin

The component plugin is one of base [Mekur]({{ '/' | relative_url }}) plugin which add base life cycle methods and properties to your widget. Other [Merkur plugins]({{ '/docs/plugins' | relative_url }}) can depends on it. 

## installation

We must add imported `componentPlugin` to widget property `$plugins`.

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

After that we have available `info`, `load`, `bootstrap`,`mount`, `unmount`, `update`, `setState`, `setProps` async methodsand `props`, `state`, `assets` properties on widget.

## Properties

### props

The `props` property define interface between Merkur widget and application. It contains data from parent application or server which are input for widget. The data must be stringify able. We don't have to direct mutate `props` instead of use [setProps]({{ '/docs/component-plugin#setprops' | relative_url }}) method.

### state

The `state` property contains current internal state of Merkur widget. The data must be stringify able. We don't have to direct mutate `state` instead of use [setState]({{ '/docs/component-plugin#setstate' | relative_url }}) method

### assets

The `assets` property contains important widget assets(css, js and others). The assets must be downloaded before widget can be created.

## Methods

All new available methods are asynchronous and we define returning value in widget's code.

### info

The `info` method returns information about widget as name, version, props, state, assets, etc. It's primary usefull for server side where we need collect important values for hydrating widget on client side.

```javascript
const { name, version, props, state, assets } = await widget.info();
```

### bootstrap

The `bootstrap` method is called only once before widget is loaded widget state and mounted. We can connect other third party code (services, listeners, etc) with widget here.

### load

The `load` method is mandatory and returns current state of widget. The load method is called before mounting widget and after changing props.

### mount
The `mount` method is used for client and server environments. On server side must return string. On client side must mount widget to HTML and must resolve promise after mounting widget to DOM is completed.

### unmount
The `unmount` method is opposite for `mount` method. On server side is not usefull but on client side mus unmount widget from HTML and must resolve promise after unmounting widget from DOM is completed.

### update
The `udpate` method is called after changing widget state and must udpate DOM.

### setState
The `setState` method is for changing widget state. The method makes shallow copy.

```javascript
console.log(widget.state); // { primitive: 1, object: { key: 'value'} };
await widget.setState({ object: { key: 'value2'} });
console.log(widget.state); // { primitive: 1, object: { key: 'value2'} };
```

### setProps
The `setProps` method is for changing widget props. The method makes shallow copy.

```javascript
console.log(widget.props); // { pathname: '/'};
await widget.setProps({ pathname: '/detail/1'});
console.log(widget.props); // { pathname: '/detail/1' };
```