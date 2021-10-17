---
layout: docs
title: Integrating Storybook into Merkur
---

# Storybook

[Storybook](https://storybook.js.org/) is an open source tool for developing UI components in isolation for React, Vue, Angular, and more. It makes building stunning UIs organized and efficient.

## Installation

At first we must install storybook to our Merkur project. The best way is using the [Storybook CLI](https://storybook.js.org/docs/react/get-started/install) to install it in a single command.

```bash
npx sb init --builder webpack5
```

After that we install merkur module for easy integration.

```bash
npm i @merkur/tool-storybook --save-dev
```

Now we must update two storybook files `./storybook/preview.js` and `./storybook/main.js`. At first we update our `./storybook/preview.js` similarly to the example below.

```javascript
// ./storybook/preview.js
// register our widget to Merkur
import '../src/client';

// receive widget properties for creating our Merkur widget instance
import widgetProperties from '../src/widget';

// helper method for creating storybook loader, which async creates our widget instance.
import { createWidgetLoader } from '@merkur/tool-storybook';

// Specific imports for your chosen view. For example Preact:
import { forceReRender } from '@storybook/preact';
import WidgetContext from '../src/components/WidgetContext';

// defined our custom widget loader
export const loaders = [
  createWidgetLoader({
    render: forceReRender, // widget must be able to update the storybook playground
    widgetProperties, // created widget properties
  })
];

// if you need Context in React or Preact widget you must define Context Provider.
export const decorators = [
   (Story, { loaded: { widget }}) => {
    return (
      <WidgetContext.Provider value={widget}>
        <Story />
      </WidgetContext.Provider>
    );
  },
];
```

Then, we add babel loader to storybook's webpack config. Fortunately, it's easy.

```javascript
// ./storybook/main.js

// ./storybook/main.js
const { pipe } = require('@merkur/tool-webpack');
const { applyBabelLoader } = require('../webpack.config.js');

module.exports = {
  .
  .
  webpackFinal: async (config) => {
    config = await = pipe(() => config, applyBabelLoader)();

    return config;
  },
  .
  .
}
```

> Note: If you use any pre-processors (webpack loaders) for building CSS styles you should also define then in `webpackFinal` function by extending given `config` object. More on that topic can be found in [official Storybook documentation](https://storybook.js.org/docs/react/configure/styling-and-css).

That's all. Now we can write our stories.

## How to write stories

You can use every [format](https://storybook.js.org/docs/react/writing-stories/introduction) which Storybook offers. For example we pick up `named exports` format and our counter component from demo page for `Preact` preview.

```javascript
// /src/component/Counter.jsx
import { useContext } from 'preact/hooks';
import WidgetContext from './WidgetContext';

export default function Counter({ counter }) {
  const widget = useContext(WidgetContext);

  return (
    <div>
      <h3>Counter widget:</h3>
      <p>Count: {counter}</p>
      <button onClick={widget.onClick}>increase counter</button>
      <button onClick={widget.onReset}>reset counter</button>
    </div>
  );
}

// /src/component/Counter.stories.jsx
import Counter from './Counter';

export default {
  title: 'Counter',
  args: {
    // Every Merkur story must have defined props property
    widget: {
      props: {},
    }
  },
};

const Template = (args, { loaded: { widget } }) => {
  return <Counter counter={widget.state.counter} />
};

export const DefaultCounter = Template.bind({});

export const TenCounter = Template.bind({});
TenCounter.args = {
  widget: {
    props: {},
    // change default widget state from 0 to 10
    state: {
      counter: 10,
      }
  }
};
```

Now run command `npm run storybook` and you will see our Counter component with two settings.
