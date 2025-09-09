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

### Setup with SelectProvider

To use the `useSelect` hook in your components, you must wrap your application with the `SelectProvider` component and pass the widget instance to it:

```javascript
import { SelectProvider } from '@merkur/plugin-select-preact';

function App({ widget }) {
	return (
		<SelectProvider widget={widget}>
			<MyComponent />
		</SelectProvider>
	);
}
```

The `SelectProvider` makes the widget available to all child components through React context, allowing `useSelect` to access the widget state.

### useSelect

The `useSelect` hook allows you to select and derive data from the widget's state. It uses memoization to avoid unnecessary recalculations and re-renders.

**Note:** The component using `useSelect` must be wrapped with `SelectProvider` for the hook to work properly.

```javascript
import { useSelect } from '@merkur/plugin-select-preact';

function MyComponent() {
	const [selectedState] = useSelect(null, (state) => ({
		value: state.value,
	}));

	return <div>{selectedState.value}</div>;
}
```

#### Parameters

- `data`: Optional additional data to pass to selectors.
- `...selectors`: One or more selector functions that receive `(state, data)` and return a derived value.

**Note:** The widget instance is automatically provided through the `SelectProvider` context, so you don't need to pass it as a parameter.

#### Returns

- An array with the derived state as the first element.

### Example

```javascript
import { SelectProvider, useSelect } from '@merkur/plugin-select-preact';

function App({ widget }) {
	return (
		<SelectProvider widget={widget}>
			<Counter />
		</SelectProvider>
	);
}

function Counter() {
	const [selected] = useSelect(null, (state) => ({ count: state.count }));
	
	return <div>Count: {selected.count}</div>;
}
```

## API

### selectPlugin

Registers the Select plugin with your widget. It hooks into the widget's `update` method and emits a `widget:update` event whenever the widget state changes, ensuring selectors are updated.

### SelectProvider

A context provider component that makes the widget available to child components. Required for `useSelect` to work.

**Props:**
- `widget`: The widget instance
- `children`: Child components that will have access to the widget through `useSelect`

### useSelect(data, ...selectors)

Hook for selecting and deriving state in Preact components. The widget is automatically provided through the `SelectProvider` context.

### createStateSelector(...selectors)

Utility for creating a memoized selector from one or more selector functions. Used internally by `useSelect`.

### setCreatorOfStateSelector(fn)

Allows you to override the default state selector creator (advanced usage).

## Events

- `widget:update`: Emitted whenever the widget's state is updated. Used internally by the Select plugin.

## Notes

- The Select plugin is designed to work with Preact. If you use another UI library, you may need to adapt the hook or use the selector utilities directly.
- Selectors should be pure functions for best performance.
