import { defineWidget } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { errorPlugin } from '@merkur/plugin-error';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

import { name, version } from '../package.json';
import './style.css';

export default defineWidget({
  name,
  version,
  $plugins: [componentPlugin, eventEmitterPlugin, errorPlugin],
  assets: [
    {
      name: 'widget.js',
      type: 'script',
    },
    {
      name: 'widget.css',
      type: 'stylesheet',
    },
  ],
  onClick(widget) {
    widget.setState({ counter: widget.state.counter + 1 });
  },
  onReset(widget) {
    widget.setState({ counter: 0 });
  },
  load(widget) {
    // We don't want to set environment into app state
    // eslint-disable-next-line no-unused-vars
    const { environment, ...restProps } = widget.props;

    return {
      counter: 0,
      ...restProps,
    };
  },
});
