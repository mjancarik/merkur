import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';
import { name, version } from '../package.json';

export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin, eventEmitterPlugin],
  assets: [
    {
      type: 'script',
      source: 'http://localhost:4444/static/widget-client.js',
    },
    {
      type: 'stylesheet',
      source: 'http://localhost:4444/static/widget-client.css',
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
};
