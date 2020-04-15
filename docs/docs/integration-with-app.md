---
layout: docs
---

# Integration with your app

Merkur widget can be connected with any framework or library but we can use it with other languages like PHP, Python or Java of course. It use REST/GRAPHQL API which has got predefined and extensible response body.

## API call for widget properties

At first we must make API call with your favorite framework. Because there are tons of frameworks or libraries so we use direct browser fetch API for example. 

```javascript
// browser
fetch('http://localhost:4000/widget')
  .then((response) => response.json())
  .then(({ body }) => {
    console.log(body);
  })

```

```json
{
  "name":"my-widget",
  "version":"0.0.1",
  "props":{},
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

After we recieve response body we must download widget assets.

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
<div id="container"><%- body.html %></div>
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

