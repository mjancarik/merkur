---
layout: docs
title: Getting started - Merkur
---

# Getting started

## Installation

We recommend creating a new  [Mekur]({{ '/' | relative_url }}) widget using `@merkur/create-widget`, which sets up everything automatically for you. You can use one of four predefined template libraries: [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) or [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) (or you can easily add your own).

```shell
npx @merkur/create-widget <name>

cd name

npm run dev // Point your browser at http://localhost:4445/
```

This will scaffold a new project in the `name` directory and start a devServer on [localhost:4445](http://localhost:4445/) and production widget server on [localhost:4444](http://localhost:4444/). Try editing a few files to get a feel for how everything works.

<img class="responsive" src="{{ '/assets/images/hello-widget.png?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur - hello widget" />

## Widget structure

If you take a look inside the created widget, you'll see this file structure:

```shell
<name>
│   package.json
│   merkur.config.mjs
└── server
│   └── config
│       │   default.json
│       │   production.json
│       │   test.json
│   └── router
│       └── error
│       └── widgetAPI
│   │   app.js
│   │   server.js
│   └── static
│   │   // static files for serving from server
└── src
│   │   style.css
│   │   widget.js
│   └── views
│       │   View.jsx
│       │   ErrorView.jsx
│   └── entries
│       │   client.js
│       │   server.js
│   └── slots
│       │   HeadlineSlot.jsx
│   └── components
│       │   Counter.jsx
│       │   MerkurIcon.jsx
│       │   Welcome.jsx
│       │   WidgetDescription.jsx
```

You'll notice a few extra files for [ESLint](https://eslint.org/) and [Jest](https://jestjs.io/) config.

### package.json

The package.json contains predefined dependencies and defines some scripts, which use Merkur [CLI]({{ '/docs/merkur-cli' | relative_url }}):

- `npm run dev` - start the widget in development mode, and watch source files for changes
- `npm run build` - build the widget in production mode
- `npm test` - run the tests
- `npm start` - start the app in production mode after you've built it

### merkur.config.mjs

The configuration file for Merkur [CLI]({{ '/docs/merkur-cli' | relative_url }})

### src

This folder can contains the two entry points for your widget — `src/entries/client.js` and `src/entries/server.js`, which is default predefined in @merkur/{framework} module and you can create your own entries and override default one. In `src/` folder you would store all code necessary for displaying the widget, such as React components, etc. Here is also the most important file `widget.js` file which is your main file for your widget.

### server

The server folder contains assets, predefined config per environment, routes and most importantly the `app.js` file.

### server/config

Merkur uses [config](https://www.npmjs.com/package/config) module for hierarchical configurations for your widget.

### server/router

This contains individual [Express](https://expressjs.com/en/guide/routing.html) routes. The most important route is widgetAPI which defined widget API interface. 

### app.js

This contains a basic [Express](https://expressjs.com/) server with predefined middleware.
