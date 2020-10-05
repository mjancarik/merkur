---
layout: docs
title: Merkur Top-Level API
---

# Merkur Top-Level API

## Module

Merkur is tiny extensible library and has got a few base methods by default.

- **createMerkur** - creates new instance of merkur in the global context under `__merkur__` variable
- **removeMerkur** - removes merkur variable from global context
- **getMerkur** - returns merkur instance
- **createMerkurWidget** - factory function for your widget

Module has some other utils methods which is useful for plugins.

- **setDefaultValueForUndefined** - set defined default value for undefined keys
- **bindWidgetToFunctions** - auto bind widget property as first parameter
- **hookMethod** - for creating hook on defined widget method, example in [plugins section]({{ '/docs/plugins' | relative_url }})
- **isFunction** - for detection function, example in [plugins section]({{ '/docs/plugins' | relative_url }})

### createMerkur

The method accepts an object with property `$plugins` which can extend merkur interface. The plugin `setup` method can be called more times than once. Therefore you need to make an extra check so you won't redefine the plugin.

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

Merkur instance contains three predefined properties `$in`, `$external` and `$dependencies`. The property `$in` is for internal usage of merkur plugins or merkur itself. Other properties are for your own usage. The properties `$external` and `$dependencies` are for storing values and sharing dependencies.

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

Other important part of Merkur instance are methods `register` and `create`. The `register` method register widget to merkur with name, version and createWidget properties. The `create` method returns a new instace of the registered widget with defined properties.

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