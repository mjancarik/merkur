---
sidebar_position: 11
title: Event Emitter Plugin
description: Learn about the Event Emitter plugin for managing events in Merkur
---

# Event emitter plugin

The event emitter plugin is one of the base [Merkur](/) plugins which adds event methods to your widget. Other [Merkur plugins](/docs/plugins) can depend on it.

## Installation

We must add import of `eventEmitterPlugin` and register it to `$plugins` property of the widget.

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

After that we have `on`, `off` and `emit` methods available on the widget.

## Methods

### on

- `eventName` - string
- `listener` - function

The `on` method adds a listener function to the end of the listeners array for the event named *eventName*.

```javascript
widget.on('save', (widget, ...rest) => {
  console.log(...rest);
});
```

### off

- `eventName` - string
- `listener` - function

The `off` method removes the specified listener from the listener array for the event named *eventName*.


```javascript
widget.off('save', (widget, ...rest) => {
  console.log(...rest);
});
```

### emit

- `eventName` - string
- `...args` - any

The `emit` method synchronously calls each of the listeners registered for the event named *eventName*, in the order they were registered, passing the supplied arguments to each.

```javascript
widget.on('save', (widget, data) => {
  console.log(data);
});

widget.emit('save', { key: 1 } );
// log to conosle { key: 1 }
```
