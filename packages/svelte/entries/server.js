import { createSvelteWidget } from '@merkur/svelte/server';

import widgetProperties from '@widget';

export const createWidget = createSvelteWidget({
  ...widgetProperties,
});
