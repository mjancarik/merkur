import { hookMethod } from '@merkur/core';

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

/**
 * Creates a validation plugin for Merkur widgets.
 * Works with any schema library that implements safeParse() method
 * (e.g., @esmj/schema, zod, superstruct, valibot, etc.)
 *
 * @param {Object} options - Plugin options
 * @param {Object} options.props - Schema object with safeParse() method for props validation
 * @param {Function} [options.onError=null] - Custom error handler function(widget, result). If null, throws validation error.
 * @returns {Object} Merkur plugin
 *
 * @example
 * // With @esmj/schema
 * import { s } from '@esmj/schema';
 * import { validationPlugin } from '@merkur/plugin-validation';
 *
 * const propsSchema = s.object({
 *   userId: s.string(),
 *   count: s.number().optional(),
 * });
 *
 * defineWidget({
 *   $plugins: [
 *     componentPlugin(),
 *     validationPlugin({ props: propsSchema }),
 *   ],
 * });
 *
 * @example
 * // With custom error handler
 * validationPlugin({
 *   props: propsSchema,
 *   onError: (widget, result) => {
 *     console.warn('Validation failed:', result.error);
 *   },
 * });
 */
export function validationPlugin(options = {}) {
  const { props, onError = null } = options;

  if (!props) {
    throw new Error('@merkur/plugin-validation: props option is required');
  }

  if (!hasSafeParseMethod(props)) {
    throw new Error(
      '@merkur/plugin-validation: props must have a safeParse() method',
    );
  }

  return () => ({
    async setup(widget) {
      widget.$in.validation = {
        props,
        onError,
      };

      return widget;
    },
    async create(widget) {
      if (ENV === DEV) {
        if (!widget.$in.component) {
          throw new Error(
            '@merkur/plugin-validation: You must install @merkur/plugin-component first',
          );
        }
      }

      // Hook setProps to validate before applying
      hookMethod(widget, 'setProps', setPropsHook);

      // Hook mount to validate initial props
      hookMethod(widget, 'mount', mountHook);

      return widget;
    },
  });
}

/**
 * Check if schema has a safeParse method
 * @param {Object} schema - Schema object to check
 * @returns {boolean} True if schema has safeParse method
 */
function hasSafeParseMethod(schema) {
  return typeof schema.safeParse === 'function';
}

/**
 * Validate props using the schema
 * @param {Object} widget - Merkur widget instance
 * @param {Object} props - Props object to validate
 * @returns {{ success: boolean, data?: any, error?: any }} Validation result
 */
function validateProps(widget, props) {
  const { props: schema } = widget.$in.validation;

  return schema.safeParse(props);
}

/**
 * Handle validation error based on onError configuration
 * @param {Object} widget - Merkur widget instance
 * @param {Object} result - Validation result with error property
 */
function handleValidationError(widget, result) {
  const { onError } = widget.$in.validation;

  if (typeof onError === 'function') {
    onError(widget, result);
    return;
  }

  const { error } = result;
  const validationError = new Error(
    error?.message || 'Props validation failed',
  );
  validationError.cause = error;
  throw validationError;
}

/**
 * Hook for setProps - validates new props before applying.
 * Skips validation if widget is not yet mounted.
 * On successful validation, passes transformed data to original setProps.
 * @param {Object} widget - Merkur widget instance
 * @param {Function} originalSetProps - Original setProps method
 * @param {Object|Function} propsSetter - New props or function returning new props
 */
async function setPropsHook(widget, originalSetProps, propsSetter) {
  if (!widget.$in.component.isMounted) {
    // If not mounted, just call original setProps without validation
    return originalSetProps(propsSetter);
  }

  // Calculate the new props
  const newPropsPartial =
    typeof propsSetter === 'function' ? propsSetter(widget.props) : propsSetter;

  // Merge with existing props (same as original setProps behavior)
  const mergedProps = {
    ...widget.props,
    ...newPropsPartial,
  };

  // Validate the merged props
  const result = validateProps(widget, mergedProps);

  if (!result.success) {
    handleValidationError(widget, result);
  } else {
    widget.props = result.data; // Update widget.props with validated/transformed data

    // Call original setProps with result.data which is the validated and potentially transformed props
    return originalSetProps(result.data);
  }
}

/**
 * Hook for mount - validates initial props before mounting.
 * Replaces widget.props with validated/transformed data on success.
 * @param {Object} widget - Merkur widget instance
 * @param {Function} originalMount - Original mount method
 * @param {...any} rest - Additional arguments passed to mount
 */
async function mountHook(widget, originalMount, ...rest) {
  // Validate initial props
  const propsToValidate = widget.props ?? {};
  const result = validateProps(widget, propsToValidate);

  if (!result.success) {
    handleValidationError(widget, result);
  } else {
    widget.props = result.data;
  }

  return originalMount(...rest);
}
