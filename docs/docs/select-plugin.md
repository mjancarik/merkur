---
layout: docs
title: Preact Select plugin - Merkur
---

# Select plugin

The Select plugin is a [Merkur]({{ '/' | relative_url }}) plugin that enables efficient selection and derivation of widget state using selectors. It is especially useful for optimizing performance in widgets with complex state or when you want to derive computed data from the state.

## Installation

To use the Select plugin, import `selectPlugin` and register it in the `$plugins` property of your widget.

```javascript
// ./src/widget.js
import { selectPlugin } from '@merkur/plugin-select-preact';

export const widgetProperties = {
	name,
	version,
	$plugins: [selectPlugin],
	// ... other properties
};
```

## Usage

The Select plugin provides a `useSelect` hook for use in Preact components, allowing you to select and derive state from your widget efficiently. It also emits an update event when the widget state changes, so your selectors always receive the latest state.

### useSelect

The `useSelect` hook allows you to select and derive data from the widget's state. It uses memoization to avoid unnecessary recalculations and re-renders.

```javascript
import { useSelect } from '@merkur/plugin-select-preact';

function MyComponent({ widget }) {
	const [selectedState] = useSelect(widget, null, (state) => ({
		value: state.value,
	}));

	return <div>{selectedState.value}</div>;
}
```

#### Parameters

- `widget`: The widget instance.
- `data`: Optional additional data to pass to selectors.
- `...selectors`: One or more selector functions that receive `(state, data)` and return a derived value.

#### Returns

- An array with the derived state as the first element.

### Example

```javascript
const [selected] = useSelect(widget, null, (state) => ({ count: state.count }));
console.log(selected.count); // Access selected state
```

## API

### selectPlugin

Registers the Select plugin with your widget. It hooks into the widget's `update` method and emits a `widget:update` event whenever the widget state changes, ensuring selectors are updated.

### useSelect(widget, data, ...selectors)

Hook for selecting and deriving state in Preact components. See usage above.

### createStateSelector(...selectors)

Utility for creating a memoized selector from one or more selector functions. Used internally by `useSelect`.

### setCreatorOfStateSelector(fn)

Allows you to override the default state selector creator (advanced usage).

## Events

- `widget:update`: Emitted whenever the widget's state is updated. Used internally by the Select plugin.

## Notes

- The Select plugin is designed to work with Preact. If you use another UI library, you may need to adapt the hook or use the selector utilities directly.
- Selectors should be pure functions for best performance.
