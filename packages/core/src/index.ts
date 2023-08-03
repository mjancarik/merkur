import { createMerkurWidget } from './createMerkurWidget';
import { createMerkur, removeMerkur, getMerkur } from './merkur';
import {
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  hookMethod,
  isFunction,
} from './utils';

export * from './types';
export {
  bindWidgetToFunctions,
  createMerkurWidget,
  createMerkur,
  getMerkur,
  hookMethod,
  isFunction,
  removeMerkur,
  setDefaultValueForUndefined,
};
