import { createUHtmlWidget } from '@merkur/uhtml/server';

import widgetProperties from '@widget';

export const createWidget = createUHtmlWidget({
  ...widgetProperties,
});
