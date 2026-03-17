import { Widget, WidgetPlugin } from '@merkur/core';

/**
 * Validation result from safeParse-style methods
 */
export type ValidationResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: unknown };

/**
 * Schema interface compatible with zod, @esmj/schema, and similar libraries.
 * Your schema must implement safeParse() method.
 */
export interface Schema<T = unknown> {
  /**
   * Safe parse method that returns a result object instead of throwing.
   * Supports both zod-style { success, data, error } and @esmj/schema { ok, value, issues }
   */
  safeParse: (
    value: unknown,
  ) => ValidationResult<T> | { ok: boolean; value?: T; issues?: unknown };
}

/**
 * Custom error handler function type
 */
export type OnErrorHandler = (
  widget: Widget,
  result: { success: false; error: unknown },
) => void;

/**
 * Plugin options for validationPlugin
 */
export interface ValidationPluginOptions<T = unknown> {
  /**
   * Schema object used for props validation.
   * Must implement safeParse() method.
   */
  props: Schema<T>;

  /**
   * Custom error handler when validation fails.
   * If null/undefined, throws the validation error.
   */
  onError?: OnErrorHandler | null;
}

/**
 * Internal state stored on widget.$in.validation
 */
export interface ValidationInternal<T = unknown> {
  props: Schema<T>;
  onError: OnErrorHandler | null;
}

/**
 * Creates a validation plugin for Merkur widgets.
 * Works with any schema library that implements safeParse() method
 * (e.g., @esmj/schema, zod, superstruct, valibot, etc.)
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
 * import { s } from '@esmj/schema';
 *
 * const propsSchema = s.object({
 *   userId: s.string(),
 *   count: s.number().optional(),
 * });
 *
 * defineWidget({
 *   $plugins: [
 *     componentPlugin(),
 *     validationPlugin({
 *       props: propsSchema,
 *       onError: (widget, result) => {
 *         console.warn('Validation failed:', result.error);
 *       },
 *     }),
 *   ],
 * });
 */
export function validationPlugin<T = unknown>(
  options: ValidationPluginOptions<T>,
): WidgetPlugin;

// Module augmentation for @merkur/core
declare module '@merkur/core' {
  interface WidgetInternal {
    validation?: ValidationInternal;
  }
}
