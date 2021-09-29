/**
 * @jest-environment jsdom
 */

import { shallow } from 'enzyme';

import { createMerkurWidget } from '@merkur/core';

import widgetProperties from '../../widget';
import View from '../View';

describe('View', () => {
  let widget = null;

  beforeEach(async () => {
    widget = await createMerkurWidget({
      ...widgetProperties,
      mount() {
        return shallow(View(widget));
      },
    });
  });

  it('should display main view', async () => {
    const wrapper = await widget.mount();

    expect(wrapper).toMatchInlineSnapshot();
  });
});
