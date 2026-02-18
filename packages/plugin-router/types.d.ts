declare module '@merkur/core' {
  interface WidgetDefinition {
		bootstrap?: (widget: Widget) => void;
		props?: {
			environment?: typeof environment;
		};
	}
}