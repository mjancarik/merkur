# Merkur - plugin-login

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/plugin-login/latest.svg)](https://www.npmjs.com/package/@merkur/plugin-login)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/plugin-login/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

The Login plugin adds `login` property to your widget with the `listenToUserEvents` and `unlistenUserEvents` methods. On the server side, these methods do nothing. It has two dependencies: [API Login JS library version 3+](https://gitlab.seznam.net/rus/login/-/wikis/widget#js-api-knihovny) and Merkur Session Storage plugin.

## About Merkur

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices. It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of four predefined template's library [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) and [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) but you can easily extend for others.

## Installation

We must import `loginPlugin` and register it to `$plugins` property of the widget. We also need to install the Session Storage plugin ([documentation for @merkur/plugin-session-storage](https://merkur.js.org/docs/session-storage-plugin)).

```javascript
// ./src/widget.js
import { loginPlugin } from '@merkur/plugin-login';

export const widgetProperties = {
  name,
  version,
  $plugins: [loginPlugin],
  // ... other properties
};

// ./src/polyfill.js
import 'whatwg-fetch';
import 'abort-controller/polyfill';
```

## Methods

### `listenToUserEvents`

- `userApiCall` - `function`
- `[listener]` - `function` (optional)

The `listenToUserEvents` method returns an array of listeners bounded to user events (`badge`, `login`, `logout` and `forget`). This method binds the original listener to user events. If we omit listener parameter, it will use a default implementation, which will try to load a user data from `sessionStorage` cache or from an API using `userApiCall` function (which is a required parameter of this method). A loaded user object will be saved in the widget state under the `user` key with these properties:
- `isLoggedIn` - `boolean`
- `isVerified` - `boolean`
- `firstname` - `string`
- `lastname` - `string`

If you want to implement a custom event listener, it will receive these values as arguments in this specific order:
- `widget` - `object`
- `userApiCall` - `function`
- `event` - `string` (an event name)
- `eventData` - `*` (an event data)

```javascript
// widget.userService.user() is our custom function which loads an user data from and API
let listeners = widget.login.listenToUserEvents(widget.userService.user);
```

### `unlistenUserEvents`
- `listeners` - `function[]`

The `unlistenUserEvents` method unbinds listeners which where previously bounded using `listenToUserEvents` method.

```javascript
let listeners = widget.login.listenToUserEvents(widget.userService.user);

widget.login.unlistenUserEvents(listeners)
```

### `openLoginWindow`

The `openLoginWindow` opens a login window.

```javascript
if (!widget.state.user.isLoggedIn) {
    widget.login.openLoginWindow();
}
```
