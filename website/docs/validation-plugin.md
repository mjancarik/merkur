---
sidebar_position: 14
title: Validation Plugin
description: Learn about the Validation plugin for props schema validation in Merkur
---

# Validation plugin

`@merkur/plugin-validation` is a Merkur plugin for schema-based validation. It provides library-agnostic validation for widget props that works with any schema library implementing the `safeParse()` interface, including:

- **[@esmj/schema](https://www.npmjs.com/package/@esmj/schema)** (recommended)
- **[zod](https://www.npmjs.com/package/zod)**
- **[valibot](https://www.npmjs.com/package/valibot)**
- Any schema library with compatible `safeParse()` API

## Installation

```bash
npm install @merkur/plugin-validation @esmj/schema
```

## Requirements

This plugin requires `@merkur/plugin-component` to be installed and registered before it.

## Basic Usage

### With @esmj/schema

```javascript
import { s } from '@esmj/schema';
import { defineWidget } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { validationPlugin } from '@merkur/plugin-validation';

const propsSchema = s.object({
  userId: s.string(),
  count: s.number().optional(),
  config: s.object({
    theme: s.enum(['light', 'dark']),
  }),
});

export default defineWidget({
  name: 'my-widget',
  version: '1.0.0',
  $plugins: [
    componentPlugin,
    validationPlugin({
      props: propsSchema,
    }),
  ],
  // ... widget implementation
});
```

### With zod

```javascript
import { z } from 'zod';
import { defineWidget } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { validationPlugin } from '@merkur/plugin-validation';

const propsSchema = z.object({
  userId: z.string(),
  count: z.number().optional(),
  config: z.object({
    theme: z.enum(['light', 'dark']),
  }),
});

export default defineWidget({
  name: 'my-widget',
  version: '1.0.0',
  $plugins: [
    componentPlugin,
    validationPlugin({
      props: propsSchema,
    }),
  ],
  // ... widget implementation
});
```

For detailed benchmarks and feature comparisons, see the [@esmj/schema documentation on npm](https://www.npmjs.com/package/@esmj/schema).

:::note
If you're already using zod in your project, you can continue using it with `@merkur/plugin-validation`. The plugin is library-agnostic and works with any schema library that implements the `safeParse()` method. But @esmj/schema is recommended.
:::


## Options

### `props` (required)

The schema object used for props validation. Must implement:

- `safeParse(value)` - Returns `{ success: boolean, data?, error? }`

### `onError` (optional)

Custom error handler function. Default: `null` (throws validation error)

| Value | Description |
|-------|-------------|
| `null` | Throws the validation error (default) |
| `function` | Custom handler `(widget, result) => void` |

#### Custom error handler example

```javascript
validationPlugin({
  props: propsSchema,
  onError: (widget, result) => {
    // Send to error tracking service
    errorTracker.captureException(result.error, {
      widget: widget.name,
    });
    
    // Or log with custom formatting
    console.warn(`Widget ${widget.name} received invalid props:`, result.error);
  },
});
```

## When Validation Runs

The plugin validates props at two points:

1. **On mount** - Initial props are validated when the widget mounts
2. **On setProps** - Props are validated each time `widget.setProps()` is called

Validation is run against the **merged props** (existing props + new props), ensuring the complete props object is valid.

On successful validation, the `result.data` (transformed/coerced values) replaces the original props. This means schemas can also perform data transformation, not just validation.

## Custom Element Integration

When using with `@merkur/integration-custom-element`, the validation plugin provides a cleaner approach for parsing HTML attributes to widget props. Instead of defining individual `attributesParser` functions, you can define a single schema that handles both validation and type coercion.

The `@esmj/schema` library supports type coercion, which automatically converts string attributes to the correct types:

```javascript
import { registerCustomElement } from '@merkur/integration-custom-element';
import { componentPlugin } from '@merkur/plugin-component';
import { validationPlugin } from '@merkur/plugin-validation';
import { s } from '@esmj/schema';

// Schema with coercion - automatically converts strings to correct types
const propsSchema = s.object({
  title: s.string(),
  theme: s.string(),
  count: s.cast.number(),  // Casts "42" → 42
  enabled: s.cast.boolean(), // Casts "true" → true
  config: s.cast.json(s.object({ apiUrl: s.string() })), // Parses JSON strings automatically
});

const widgetDefinition = {
  name: 'my-widget',
  version: '1.0.0',
  $plugins: [
    componentPlugin,
    validationPlugin({ props: propsSchema }),
  ],
  // ... widget implementation
};

registerCustomElement({
  widgetDefinition,
  observedAttributes: ['title', 'theme', 'count', 'enabled', 'config'],
});
```

```html
<my-widget 
  title="Hello World"
  theme="dark"
  count="42"
  enabled="true"
  config='{"apiUrl": "https://api.example.com"}'
></my-widget>
```

### Benefits over attributesParser

| Feature | `attributesParser` | `validationPlugin` + schema |
|---------|-------------------|------------------------------|
| Type coercion | Manual per attribute | Automatic via schema |
| Validation | None built-in | Full validation with errors |
| Type safety | No | Yes (with TypeScript) |
| Reusability | Limited | Schema can be reused |
| Error handling | Manual | Configurable via `onError` |
| Default values | Not supported | Via schema defaults |

## TypeScript

Full TypeScript support is included:

```typescript
 import { defineWidget } from '@merkur/core';
 import { componentPlugin } from '@merkur/plugin-component';
import { validationPlugin, type ValidationPluginOptions } from '@merkur/plugin-validation';
import { s, type Infer } from '@esmj/schema';

const propsSchema = s.object({
  userId: s.string(),
  count: s.number().optional(),
});

type Props = Infer<typeof propsSchema>;

const options: ValidationPluginOptions<Props> = {
  props: propsSchema,
};

export default defineWidget({
  $plugins: [
    componentPlugin,
    validationPlugin(options),
  ],
});
```