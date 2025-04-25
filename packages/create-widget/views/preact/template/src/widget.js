/* eslint-disable no-unused-vars */
import { defineWidget } from '@merkur/core';
import {
  componentPlugin,
  createViewFactory,
  createSlotFactory,
} from '@merkur/plugin-component';
import { errorPlugin } from '@merkur/plugin-error';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

import HeadlineSlot from './slots/HeadlineSlot';
import ErrorView from './views/ErrorView';
import View from './views/View';

import pkg from '../package.json';

import './style.css';

export default defineWidget({
  name: pkg.name,
  version: pkg.version,
  viewFactory: createViewFactory((widget) => ({
    View,
    ErrorView,
    slotFactories: [
      createSlotFactory((widget) => ({
        name: 'headline',
        View: HeadlineSlot,
      })),
    ],
  })),
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
    const { environment, ...restProps } = widget.props;

    return {
      counter: 0,
      ...restProps,
    };
  },
});
