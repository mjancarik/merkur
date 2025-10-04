---
sidebar_position: 4
title: Merkur Top-Level API
description: Learn about Merkur's core API functionality
---

# Merkur Top-Level API

## Module

Merkur is a tiny extensible library and has got a few base methods by default.

- **createMerkur** - creates new instance of Merkur in the global context under the `__merkur__` variable
- **removeMerkur** - removes the Merkur variable from global context
- **getMerkur** - returns the Merkur instance
- **createMerkurWidget** - factory function for your widget

Module has some other utils methods which are useful for plugins.

- **setDefaultValueForUndefined** - set defined default value for undefined keys
- **bindWidgetToFunctions** - auto bind widget property as first parameter
- **hookMethod** - create a hook on a defined widget method, example use in [plugins section](/docs/plugins)
- **isFunction** - detect whether a value is a function, example use in [plugins section](/docs/plugins)

### createMerkur

The method accepts an object with property `$plugins` which can extend Merkur interface. Please note that the plugin `setup` method may be called more than once - you will have to make an extra check so you won't redefine the plugin accidentally.

```javascript
import { createMerkur } from '@merkur/core';

const myDummyMerkurPlugin = {
  setup(merkur) {
    if (typeof merkur.dummy === 'function') {
      return;
    }

    merkur.dummy = () => {
      console.log('My dummy function');
    };
  }
}

const merkur = createMerkur({
  $plugins: [myDummyMerkurPlugin]
});

```

## Merkur instance

The Merkur instance contains three predefined properties `$in`, `$external` and `$dependencies`. The property `$in` is for internal usage of merkur plugins or Merkur itself. Other properties are for your own usage. The properties `$external` and `$dependencies` are for storing values and sharing dependencies.

```javascript
import { getMerkur } from '@merkur/core';

console.log(getMerkur());
// {
//   $in: {
//     widgetFactory: {},
//   },
//   $external: {},
//   $dependencies: {},
//   register,
//   create,
// };
```

Other important part of the Merkur instance are methods `register` and `create`. The `register` method register widget to Merkur with a `name`, `version` and `createWidget` properties. The `create` method returns a new instance of the registered widget with defined properties.

```javascript
import { getMerkur } from '@merkur/core';

const merkur = getMerkur();
const widgetProperties = {
  name: 'my-wdiget',
  version: '0.0.1',
  createWidget: () => {
    // your defined factory function
  },
  ...
};

merkur.register(widgetProperties);
const widget = merkur.create(widgetProperties);
```
