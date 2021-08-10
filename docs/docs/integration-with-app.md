---
layout: docs
title: Integrating Merkur widget to application
---

# Integration with your app

Merkur widget can be connected with any framework or library and we can use it with other languages like PHP, Python or Java of course. It uses REST/GRAPHQL API which has a predefined and extensible response body.

## API call for widget properties

At first we must make an API call with your framework of choice. In this example we will use the built-in browser fetch API. Feel free to choose yours.

```javascript
// browser
(async() => {
  const widgetClassName = 'widget__container';
  const widgetProperties = await fetch(`http://localhost:4444/widget`)
    .then((response) => response.json())
    .then((data) => {
      /**
       * Set containerSelector for our widget. Can already come predefined
       * in widget response with some defaults, but it's usually overridden
       * on client, to allow for more control.
       */
      data.containerSelector = `.${widgetClassName}`;

      return data;
    });

  console.log(widgetProperties);
}();
```

```json
{
  "name":"my-widget",
  "version":"0.0.1",
  "containerSelector": ".widget__container",
  "state":{
    "counter": 0
  },
  "assets":[
    {
      "name": "polyfill.js",
      "type": "script",
      "source": {
        "es5": "http://localhost:4444/static/es5/polyfill.31c5090d8c961e43fade.js"
      },
      "test": "return window.fetch"
    },
    {
      "name": "widget.js",
      "type": "script",
      "source": {
        "es11": "http://localhost:4444/static/es11/widget.4521af42bfa3596bb128.js",
        "es9": "http://localhost:4444/static/es9/widget.6961af42bfa3596bb147.js",
        "es5": "http://localhost:4444/static/es5/widget.31c5090d8c961e43fade.js"
      },
      "attr": {
        "async": true,
        "custom-attribute": "foo"
      },
    },
    {
      "name": "widget.css",
      "type": "stylesheet",
      "source": "http://localhost:4444/static/es11/widget.814e0cb568c7ddc0725d.css"
    }
  ],
  "html":"\n      <div class=\"merkur__page\">\n        <div class=\"merkur__headline\">\n          <div class=\"merkur__view\">\n            \n    <div class=\"merkur__icon\">\n      <img src=\"http://localhost:4444/static/merkur-icon.png\" alt=\"Merkur\">\n    </div>\n  \n            \n    <h1>Welcome to <a href=\"https://github.com/mjancarik/merkur\">MERKUR</a>,<br> a javascript library for front-end microservices.</h1>\n  \n            \n    <p>The widget's name is <strong>my-widget@0.0.1</strong>.</p>\n  \n          </div>\n        </div>\n        <div class=\"merkur__view\">\n          \n    <div>\n      <h2>Counter widget:</h2>\n      <p>Count: 0</p>\n      <button onclick=\"return ((...rest) =&gt; {\n        return originalFunction(widget, ...rest);\n      }).call(this, event)\">\n        increase counter\n      </button>\n      <button onclick=\"return ((...rest) =&gt; {\n        return originalFunction(widget, ...rest);\n      }).call(this, event)\">\n        reset counter\n      </button>\n    </div>\n  \n        </div>\n      </div>\n  "
}
```

## Revive merkur widget in browser (SPA)

After we receive response body, we first create the widget container.

```javascript
  const widgetContainer = document.createElement('div');
  widgetContainer.classList.add(widgetClassName);
  widgetContainer.innerHTML = widgetProperties.html;
```

After that we must download widget assets, insert widget container into DOM and revive our widget.
For downloading assets we can use the `loadAssets` method from `@merkur/integration` module. Assets can have custom attributes defined in `attr` object. The only default attribute is `defer` and you can override it by setting it as a custom attribute with value `false`. Assets may contain also a test expression. If test expression evaluates to `false` the asset will be loaded. A full example of a Merkur widget integration into an SPA application:

```javascript
import { loadAssets } from '@merkur/integration';
import { getMerkur } from '@merkur/core';

(async() => {
  const widgetClassName = 'widget__container';

  // make API call to widget
  const widgetProperties = await fetch(`http://localhost:4444/widget`)
    .then((response) => response.json())
    .then((data) => {
      // define container selector for our widget
      data.containerSelector = `.${widgetClassName}`;

      return data;
    });

    // create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.classList.add(widgetClassName);
    widgetContainer.innerHTML = widgetProperties.html;

    // load widget assets
    await loadAssets(widgetProperties.assets);

    // insert widget container to DOM
    document.body.appendChild(widgetContainer);

    // create instance of merkur widget
    const widget = await getMerkur().create(widgetProperties);

    // alive merkur widget
    return widget.mount();
}();
```

If your application doesn't use npm modules, you can handle assets your own way and add `onload` method for script assets, where you will revive the merkur widget. A primitive example:

```javascript

(async() => {
  const widgetClassName = 'widget__container';
  const widgetProperties = await fetch(`http://localhost:4444/widget`)
    .then((response) => response.json())
    .then((data) => {
      // added container selector for our widget
      data.containerSelector = `.${widgetClassName}`;

      return data;
    });

    // create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.classList.add(widgetClassName);
    widgetContainer.innerHTML = widgetProperties.html;

    // own very primitive handling widget assets
    widgetProperties.assets.forEach((asset) => {
      if (asset.type === 'script') {
        let script = document.createElement('script');
        script.onload = () => {
          __merkur__.create(widgetProperties)
            .then((widget) => {
              widget.mount();
            });
        };
        script.src = asset.es5.source;
        document.body.appendChild(script);
      }

      if (asset.type === 'stylesheet') {
        // insert to page similar as script tag
      }
    });

    // insert widget container to DOM
    document.body.appendChild(widgetContainer);
}();
```

## Hydrate server side rendering widget (MPA)

After we receive response from the widget API call we must update the final HTML which is sent to the browser. First we add assets:

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <% body.assets.forEach((asset) => { %>
    <%if (asset.type === 'stylesheet') { %>
      <link rel='stylesheet' href='<%= asset.source %>' />
    <% } %>

    <%if (asset.type === 'script') { %>
     <%if (typeof asset.source === 'string') { %>
        <script src='<%= asset.source %>' defer='true'></script>
      <% } %>
      <%if (typeof asset.source === 'object') { %>
        <script src='<%= asset.source.es5 %>' defer='true'></script>
      <% } %>
    <% } %>
  <% }); %>
  <title>MERKUR - hello widget</title>
</head>
```

Then we add the widget HTML to our page:

```html
<div class="<%= widgetClassName %>"><%- body.html %></div>
```

The last step is to hydrate the widget in your app after the page is loaded:

```html
<script>
  window.addEventListener('load', () => {
    var widgetProperties = <%- JSON.stringify(body) %>;
    // define widget container selector
    widgetProperties.containerSelector = '.<%= widgetClassName %>';
    __merkur__.create(widgetProperties)
      .then((widget) => {
        widget.mount();
      });
  });
</script>
```

## Integration with React

For easy integration with React library we created the `@merkur/integration-react` module. The module is designed for both client-side and server-side use.

You can use your own application stack to make the API call for `widgetProperties`. You then pass `widgetProperties` from the API call result to `MerkurWidget`. The component then automatically generates `div` container with appropriate selector (currently onl `id` and `className` are supported), based on the one defined in widget properties and takes care of all the hard work for you.

```jsx
import React from 'react';
import { MerkurWidget } from '@merkur/integration-react';

// example in browser
const widgetClassName = 'widget__container';
let widgetProperties = await fetch(`http://localhost:4444/widget`)
  .then((response) => response.json())
  .then((data) => {
    data.containerSelector = `.${widgetClassName}`;
    return data;
  })

React.render(
  <div className="app">
    <MerkurWidget widgetProperties={widgetProperties}>
      <div>
        Fallback for undefined widgetProperties
      </div>
    </MerkurWidget>
  </div>,
  document.body
);
```

Children component(s) passed to `<MerkurWidget />` are used as a fallback when the widget is not yet ready or an error happened. This can be used to display loading placeholders or error messages. To differentiate between loading and error states, pass a function as children.

```jsx
return (
  <MerkurWidget widgetProperties={widgetProperties}>
    {({ error} ) => error ? <span>Error happened.</span> : <span>Loading...</span>}
  </MerkurWidget>
)
```

You can also react to component events through callbacks.
- When widget is mounted, a function passed through `onWidgetMounted` prop is called with the widget instance.
- Before the widget is unmounted, `onWidgetUnmounting` is called.
- Whenever error occurs during the widget lifetime, an `onError` function prop is called.

```jsx
return (
  <MerkurWidget
      widgetProperties={widgetProperties}
      onWidgetMounted={widget => this._widgetMounted()}
      onWidgetUnmouting={widget => this._widgetUnmounting()}
      onError={error => this._handleError(error)}>
    <div>
      Fallback for undefined widgetProperties
    </div>
  </MerkurWidget>
);
```

Below you can see visualization of how the react component handles synchronization with widget's own lifecycle.

<a href="{{ '/assets/images/merkur-integration-lifecycle.png?v=' | append: site.github.build_revision | relative_url }}" target="_blank" title="Merkur - integration React - lifecycle methods">
  <img class="responsive" src="{{ '/assets/images/merkur-integration-lifecycle.png?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur - integration React - lifecycle methods" />
</a>


### Slots

There's also React component to handle Merkur slots - `MerkurSlot`. It has largely simplified api requiring only `widgetProperties` and `slotName` upon creation, where:

 - `slotName` - represents the name of the slot, fetched from the API, that should be rendered here.
 - `widgetProperties` - the same widget properties passed to the main react `MerkurWidget` component.

It also supports rendering of fallback (loader/error) the same way the main component does. However there's no error handling in this component, this means that you can still pass function as a children, but the received `error` object will always contain `{ error: null }` no matter the situation.

The `MerkurSlot` component doesn't handle the widget's lifecycle the same way as the `MerkurWidget` does, this means that it's expecting that the `MerkurWidget` component is also used, which takes care of the widget lifecycle. `MerkurSlot` component can't be used on it's own without using `MerkurWidget` anywhere else in the React component tree.

```jsx
return (
  <MerkurSlot
    slotName={'headline'}
    widgetProperties={widgetProperties}>
    <div>
      Fallback for undefined widgetProperties
    </div>
  </MerkurSlot>
)
```
