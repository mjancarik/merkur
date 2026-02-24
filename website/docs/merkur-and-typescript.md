# Merkur and TypeScript

While Merkur packages are written in plain JavaScript, the core package and most of its plugins ships with basic typing supplied by type definition files (`types.d.ts`). You should be aware of these main interfaces:


## `WidgetDefinition`

The object passed to the `defineWidget()` function, which serves as the main config file of a Merkur widget instance. 

## `WidgetPartial`

The widget instance, as it looks while the widget is being initialized. This is the type passed into the `setup()` method you define on the `WidgetDefinition` object, all the lifecycle methods created by `@merkur/plugin-component`, and all other similar creation-in-progress methods.

The main difference from `WidgetDefinition` is that many keys are set to default values and thus always present. The typing does this automatically if you extend the `WidgetDefinition` and `RequiredWidgetKeys` interfaces like this:

```ts
interface WidgetDefinition {
    myMethod?: (widget: WidgetPartial, otherAttr:string) => void;
}

interface RequiredWidgetKeys {
    myMethod: unknown; // the type here is irrelevant, we recommend `unknown` as a convention
}
```

## `Widget`

The final widget instance, as it looks during the lifetime of the widget. The crucial difference from `WidgetPartial` is that all the methods are bound to the widget, changing their signatures - e.g. `widget.pluginMethod(widget, otherAttr)` becomes `widget.pluginMethod(otherAttr)`. **NOTE:** This happens automatically for all methods on the `widget` object during `createMerkurWidget()` - meaning, if you extend the `WidgetPartial` interface with a method that does *not* have `WidgetPartial` as its first attribute, this method will not work correctly on a fully initialized widget!

