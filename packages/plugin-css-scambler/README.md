# Merkur - plugin-css-scrambler

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/plugin-error/latest.svg)](https://www.npmjs.com/package/@merkur/plugin-error)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/plugin-error/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`merkur/plugin-css-scrambler` scrambles css classes for production build.

```
npm i --save @merkur/plugin-css-scrambler
```

Add postcss to your webpack build process and register postcss plugin.

```javascript
const postCssScrambler = require('@merkur/plugin-css-scrambler/postcss');
const path = require('path');

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

Load generated hashtable in widget router

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

Register plugin in your `widget.js`.

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

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices. It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of four predefined template's library [React](https://reactjs.org/), [Preact](https://preactjs.com/), [hyperHTML](https://viperhtml.js.org/hyper.html) and [µhtml](https://github.com/WebReflection/uhtml#readme) but you can easily extend for others.
