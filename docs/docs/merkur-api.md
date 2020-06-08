---
layout: docs
title: Merkur Top-Level API
---

# Merkur Top-Level API

## Module

Merkur is tiny extensible library and has got few base methods by default.

- createMerkur - create new instance of merkur to global context in variable `__merkur__`
- removeMerkur - remove merkur variable from global context
- getMerkur - return merkur instance
- createMerkurWidget - factory function for your widget

### createMerkur

The method recieve object with property `$plugins` which can extend merkur interface. The plugin `setup` method can be called more times than once.

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

Merkur instance contains three predefined properties `$in`, `$external` and `$dependencies`. The property `$in` is for internals usage of merkur plugins or merkur itself. Other properties are for your own usage. The properties `$external` and `$dependencies` are for storing values and sharing dependencies. 

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

Other important part of Merkur instance is methods `register` and `create`. The `register` method register widget to merkur with name, version and createWidget properties. The `create` method return new instace of registered widget with defined properties. 

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