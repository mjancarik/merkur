---
layout: docs
title: Integrating Merkur widget to application
---

# Integration with your app

Merkur widget can be connected with any framework or library but we can use it with other languages like PHP, Python or Java of course. It use REST/GRAPHQL API which has got predefined and extensible response body.

## API call for widget properties

At first we must make API call with your favorite framework. Because there are tons of frameworks or libraries so we use direct browser fetch API for example. 

```javascript
// browser
const widgetClassName = 'widget__container';
fetch(
  `http://localhost:4000/widget?containerSelector=${
    encodeURIComponent(`.${widgetClassName}`)
  }`)
  .then((response) => response.json())
  .then(({ body }) => {
    console.log(body);
  })
```

```json
{
  "name":"my-widget",
  "version":"0.0.1",
  "props":{
    "containerSelector": ".widget__container"
  },
  "state":{
    "counter":0
  },
  "assets":[
    {
      "type":"script",
      "source":"http://localhost:4444/static/widget-client.js"
    },
    {
      "type":"stylesheet",
      "source":"http://localhost:4444/static/widget-client.css"
    }
  ],
  "html":"\n      <div class=\"merkur__page\">\n        <div class=\"merkur__headline\">\n          <div class=\"merkur__view\">\n            \n    <div class=\"merkur__icon\">\n      <img src=\"http://localhost:4444/static/merkur-icon.png\" alt=\"Merkur\">\n    </div>\n  \n            \n    <h1>Welcome to <a href=\"https://github.com/mjancarik/merkur\">MERKUR</a>,<br> a javascript library for front-end microservices.</h1>\n  \n            \n    <p>The widget's name is <strong>my-widget@0.0.1</strong>.</p>\n  \n          </div>\n        </div>\n        <div class=\"merkur__view\">\n          \n    <div>\n      <h2>Counter widget:</h2>\n      <p>Count: 0</p>\n      <button onclick=\"return ((...rest) =&gt; {\n        return originalFunction(widget, ...rest);\n      }).call(this, event)\">\n        increase counter\n      </button>\n      <button onclick=\"return ((...rest) =&gt; {\n        return originalFunction(widget, ...rest);\n      }).call(this, event)\">\n        reset counter\n      </button>\n    </div>\n  \n        </div>\n      </div>\n  "
}
```

## Alive merkur widget in browser (SPA)

After we recieve response body we must create widget container at first.

```javascript
let widgetContainer = document.createElement('div');
widgetContainer.innerHTML = body.html;
```

After that we must download widget assets and insert widget container to DOM.

```javascript
body.assets.forEach((asset) => {
  if (asset.type === 'script') {
    let script = document.createElement('script');
    script.src = asset.source;
    document.body.appendChild(script);
  }

  if (asset.type === 'stylesheet') {
    // insert to page simalar as script
  }
});

document.body.appendChild(widgetContainer);
```

The last one step is alive our widget in your app. We add onload method for script asset.

```javascript
if (asset.type === 'script') {
  let script = document.createElement('script');
  script.onload = () => {
    let widget = __merkur__.create(body);

    widget.mount();
  };
  script.src = asset.source;
  document.body.appendChild(script);
}
```

## Hydrate server side rendering widget (MPA)

After we recieve response body we must update html which is sent to the browser. We add assets.

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <% body.assets.forEach((asset) => { %>
    <%if (asset.type === 'stylesheet') { %>
      <link rel='stylesheet' href='<%= asset.source %>' />
    <% } %>
    <%if (asset.type === 'script') { %>
      <script src='<%= asset.source %>' defer='true'></script>
    <% } %>
  <% }); %>
  <title>MERKUR - hello widget</title>
</head>
```

Then we add widget html to our page.

```html
<div class="<%= widgetClassName %>"><%- body.html %></div>
```

The last one step is hydrate our widget in your app after page is loaded.

```html
<script>
  window.addEventListener('load', () => {
    __merkur__.create(<%- JSON.stringify(body) %>)
      .then((widget) => {
        widget.mount();
      });
  });
</script>
```

## Integration with React

For easy integration with React library we created `@merkur/integration-react` module. The module is designed for client side and also for server side. You can use your own application stack for making API call for receiving `widgetProperties`. You only pass `widgetProperties` and `widgetClassName` from API call to `MerkurComponent`. The component make hard work for you.

```jsx

import React from 'react';
import { MerkurComponent } from '@merkur/integration-react';

// example in browser
const widgetClassName = 'widget__container';
let widgetProperties = await fetch(
  `http://localhost:4000/widget?containerSelector=${
    encodeURIComponent(`.${widgetClassName}`)
  }`)
  .then((response) => response.json())
  .then(({ body }) => {
    return body;
  })

React.render(
  <div className="app">
    <MerkurComponent 
        widgetProperties = {widgetProperties}
        widgetClassName = {widgetClassName}>
      <div>
        Fallback for undefined widgetProperties
      </div>
    </MerkurComponent>
  </div>,
  document.body
);
```