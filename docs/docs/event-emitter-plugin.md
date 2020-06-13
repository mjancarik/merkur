---
layout: docs
title: Event emitter plugin - Merkur
---

# Event emitter plugin

The event emitter plugin is one of base [Merkur]({{ '/' | relative_url }}) plugin which adds event methods to your widget. Other [Merkur plugins]({{ '/docs/plugins' | relative_url }}) can depends on it. 

## Installation

We must add imported `eventEmitterPlugin` to widget property `$plugins`.

```javascript
// ./src/widget.js
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

export const widgetProperties = {
  name,
  version,
  $plugins: [eventEmitterPlugin],
  // ... other properties
};

```

After that we have got available `on`, `off` and `emit`methodson widget.

## Methods

### on

- eventName - string
- listener - function 

The `on` method adds the listener function to the end of the listeners array for the event named eventName.

```javascript
widget.on('save', (widget, ...rest) => {
  console.log(...rest);
});
```

### off

- eventName - string
- listener - function 

The `off` method removes the specified listener from the listener array for the event named eventName.


```javascript
widget.off('save', (widget, ...rest) => {
  console.log(...rest);
});
```

### emit

- eventName - string
- ...args - any

The `emit` method synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.

```javascript
widget.on('save', (widget, data) => {
  console.log(data);
});

widget.emit('save', { key: 1 } );
// log to conosle { key: 1 }
```

