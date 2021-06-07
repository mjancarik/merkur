/**
 * @jest-environment jsdom
 */

import { h } from 'preact'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';
import { createMerkurWidget } from '@merkur/core';

import View from '../View';
import widgetProperties from '../../widget';

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
