/**
 * @jest-environment jsdom
 */
import {
  render,
  fireEvent,
  cleanup,
  prettyDOM,
  screen,
} from '@testing-library/preact';

import { createMerkurWidget } from '@merkur/core';

import widgetProperties from '../../widget';
import View from '../View';

describe('View', () => {
  let widget = null;

  beforeEach(async () => {
    widget = await createMerkurWidget({
      ...widgetProperties,
      mount(widget) {
        widget.$external.result = render(View(widget));
        return widget.$external.result;
      },
      unmount() {
        cleanup();
      },
      update() {
        return widget.$external.result.rerender(View(widget));
      },
    });
  });

  afterEach(() => {
    widget.unmount();
  });

  it('should display main view', async () => {
    const { container } = await widget.mount();

    expect(prettyDOM(container)).toMatchSnapshot();
  });

  it('should increase counter', async () => {
    const { container } = await widget.mount();

    const button = screen.getByText('increase counter');

    fireEvent.click(button);

    expect(prettyDOM(container)).toMatchSnapshot();
  });
});
