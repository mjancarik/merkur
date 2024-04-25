# Merkur - plugin-css-scrambler - deprectecated

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/plugin-css-scrambler/latest.svg)](https://www.npmjs.com/package/@merkur/plugin-css-scrambler)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/plugin-css-scrambler/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`merkur/plugin-css-scrambler` scrambles css classes for production build.
```
npm i --save @merkur/plugin-css-scrambler
npm i --save-dev postcss postcss-loader
```
### 1. Generate hashtable at build time
This can be achieved by extending webpack config with provided drop-in function. This function will find existing `postcss-loader` and extend it's config to use scrambling plugin or will define `postcss-loader` for default CSS rule.
```diff
+ const { applyPostCssScramblePlugin } = require('@merkur/plugin-css-scrambler/postcss');
module.exports = Promise.all([
-  pipe(createWebConfig, applyBabelLoader)(),
+  pipe(createWebConfig, applyBabelLoader, applyPostCssScramblePlugin)(),
-  pipe(createWebConfig, applyBabelLoader, applyES9Transformation)(),
+  pipe(createWebConfig, applyBabelLoader, applyES9Transformation, applyPostCssScramblePlugin)(),
  pipe(createNodeConfig, applyBabelLoader)(),
]);
```
If you have custom webpack configuration you can just define `postcss-loader` for your styles rule and then call `applyPostCssScramblePlugin` or you can apply the scramler plugin manually.
```javascript
const path = require('path');
const { postCssScrambler } = require('@merkur/plugin-css-scrambler/postcss');
{
    loader: 'postcss-loader',
    options: {
        postcssOptions: {
            plugins: [
                postCssScrambler({
                    generateHashTable: true,
                    hashTable: path.resolve(
                        process.env.WIDGET_DIRNAME,
                        './build/static/hashtable.json'
                    ),
                }),
            ],
        },
    },
}
```
### 2. Load generated hashtable in widget router
```javascript
const { loadClassnameHashtable } = require('@merkur/plugin-css-scrambler/server');
const merkurModule = require('../../../build/widget.cjs');
const classnameHashtable = loadClassnameHashtable(
    path.resolve(__dirname, '../../build/static/hashtable.json')
);
router.get('/widget', asyncMiddleware(async (req, res) => {
    const widget = await merkurModule.createWidget({
        classnameHashtable
        props: {
            // ...
        }
    });
    // ...
}));
```
### 3. Register plugin in your `widget.js`.
```javascript
import { cssScramblePlugin } from '@merkur/plugin-css-scrambler';
export const widgetProperties = {
    // ...
    $plugins: [
        // ...
        cssScramblePlugin,
    ]
}
```
Now you should use `cn` function from widget object instead of `classname` package directly.
```jsx
import WidgetContext from './WidgetContext';
export default function Counter({ counter }) {
  const widget = useContext(WidgetContext);
  const [visible, setVisibility] = useState(false);
  return (
    <div className={widget.cn({
        counter: true,
        'counter--visible': visible
    })}>
        {* ... *}
    </div>
  );
}
```

## About Merkur

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices(micro frontends). It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of six predefined template's library [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) and [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) but you can easily extend for others.
