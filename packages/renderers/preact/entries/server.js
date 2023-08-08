import { createPreactWidget } from '@merkur/preact/server';

import widgetProperties from '@widget';

export const createWidget = createPreactWidget({
  ...widgetProperties,
});
