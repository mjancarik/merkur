# Merkur - plugin-style-inhibitor

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/plugin-css-scrambler/latest.svg)](https://www.npmjs.com/package/@merkur/plugin-css-scrambler)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/plugin-css-scrambler/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`merkur/plugin-style-inhibitor` inhibits css rules inherited from outside of root element. It reset's all affected css properties to values defined in widget stylesheet or default CSS value.

```
npm i --save @merkur/plugin-style-inhibitor
```

### 1. Register plugin in your `widget.js`.

```javascript
import { styleInhibitorPlugin } from '@merkur/plugin-style-inhibitor';

export const widgetProperties = {
    // ...
    $plugins: [
        // ...
        styleInhibitorPlugin,
    ]
}
```

> Note! For style inhibitor to work correctly in CORS affected environment you need to define all of you stylesheets as `inlineStyle`.

```javascript
export const widgetProperties = {
    // ...
    $plugins: [
        // ...
        styleInhibitorPlugin,
    ],
    assets: [
        // ...
        {
            name: 'style.css',
            type: 'inlineStyle',
        }
    ],
};
```

## About Merkur

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices(micro frontends). It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of six predefined template's library [React](https://reactjs.org/), [Preact](https://preactjs.com/), [hyperHTML](https://viperhtml.js.org/hyper.html), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) and [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) but you can easily extend for others.
