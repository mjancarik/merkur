import { createMerkur } from '@merkur/core';

import { WebSocketClient } from './WebSocketClient.mjs';

import { reload } from './reload.mjs';
import { hmr } from './hmr.mjs';

const MERKUR_CREATE_ORIGINAL = Symbol('MERKUR_CREATE_ORIGINAL');
const { __merkur_dev__ } = window;

const webSocket = new WebSocketClient(__merkur_dev__.merkurConfig.socketServer);
__merkur_dev__.webSocket = webSocket;
__merkur_dev__.widgets = [];

webSocket.init();

webSocket.subscribe(reload);
webSocket.subscribe(hmr);

if (window?.__merkur__?.create) {
  const originalMerkurCreate = window.__merkur__.create;
  window.__merkur__.create = async function devClientHook(...rest) {
    const widget = await originalMerkurCreate(...rest);

    __merkur_dev__.widgets.push(widget);

    return widget;
  };
}

function hookMerkurCreate() {
  if (
    window?.__merkur__?.create &&
    !window.__merkur__.create[MERKUR_CREATE_ORIGINAL]
  ) {
    const originalMerkurCreate = window.__merkur__.create;

    window.__merkur__.create = async function devClientHook(...rest) {
      const widget = await originalMerkurCreate(...rest);

      __merkur_dev__.widgets.push(widget);

      return widget;
    };

    window.__merkur__.create[MERKUR_CREATE_ORIGINAL] = originalMerkurCreate;
  }
}
createMerkur();
hookMerkurCreate();
