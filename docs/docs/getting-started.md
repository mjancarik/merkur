---
layout: docs
title: Getting started - Merkur
---

# Getting started

## Installation

We recommend creating a new  [Mekur]({{ '/' | relative_url }}) widget using `@merkur/create-widget`, which sets up everything automatically for you. You can use one of six predefined template libraries: [React](https://reactjs.org/), [Preact](https://preactjs.com/), [hyperHTML](https://viperhtml.js.org/hyper.html), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) or [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) (or you can easily add your own).

```shell
npx @merkur/create-widget <name>

cd name

npm run dev // Point your browser at http://localhost:4444/
```

This will scaffold a new project in the `name` directory and start a server on [localhost:4444](http://localhost:4444/). Try editing a few files to get a feel for how everything works.

<img class="responsive" src="{{ '/assets/images/hello-widget.png?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur - hello widget" />

## Widget structure

If you take a look inside the created widget, you'll see this file structure:

```shell
<name>
│   package.json
│   webpack.config.js
└── server
│   └── config
│       │   default.json
│       │   production.json
│       │   test.json
│   └── router
│       └── error
│       └── playground
│       └── widgetAPI
│   │   app.js
│   │   server.js
│   └── static
│   │   // static files for serving from server
└── src
│   │   style.css
│   │   widget.js
│   │   client.js
│   │   server.js
│   └── views
│       │   View.jsx
│   └── slots
│       │   HeadlineSlot.jsx
│   └── component
│       │   Counter.jsx
│       │   MerkurIcon.jsx
│       │   Welcome.jsx
│       │   WidgetDescription.jsx
```

You'll notice a few extra files for [ESLint](https://eslint.org/), [Babel](https://babeljs.io/) and [Jest](https://jestjs.io/) config.

### package.json

The package.json contains predefined dependencies and defines some scripts:

- `npm run dev` - start the widget in development mode, and watch source files for changes
- `npm run build` - build the widget in production mode
- `npm test` - run the tests
- `npm start` - start the app in production mode after you've built it

### src

This folder contains the two entry points for your widget — `src/client.js` and `src/server.js`. Here you would store all code necessary for displaying the widget, such as React components.

### server

The server folder contains assets, predefined config per environment, routes and most importantly the `app.js` file.

### server/config

Merkur use [config](https://www.npmjs.com/package/config) module for hierarchical configurations for your widget.

### server/router

This contains individual [Express](https://expressjs.com/en/guide/routing.html) routes. The most important route is widgetAPI which defined widget API interface. You can find here also playground route for development purpose.

### app.js

This contains a basic [Express](https://expressjs.com/) server with predefined middleware.
