---
sidebar_position: 2
title: Getting Started
description: Get started with Merkur - creating and setting up your first widget
---

# Getting started

## Installation

We recommend creating a new Merkur widget using `@merkur/create-widget`, which sets up everything automatically for you. You can use one of four predefined template libraries: [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) or [vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) (or you can easily add your own).

```shell
npx @merkur/create-widget <name>

cd name

npm run dev # Point your browser at http://localhost:4445/
```

This will scaffold a new project in the `name` directory and start a devServer on [localhost:4445](http://localhost:4445/) and production widget server on [localhost:4444](http://localhost:4444/). Try editing a few files to get a feel for how everything works.

You can also scaffold the widget into the **current directory** by passing `.` as the name:

```shell
# create new directory and cd into it
mkdir my-widget && cd my-widget

# or clone the repo and cd into it
git clone <repo-url> <repo-dirname> && cd <repo-dirname>

npx @merkur/create-widget .

npm run dev # Point your browser at http://localhost:4445/
```

![Merkur - hello widget](/img/hello-widget.png)

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

The package.json contains predefined dependencies and defines some scripts, which use Merkur [CLI](/docs/merkur-cli):

- `npm run dev` - start the widget in development mode, and watch source files for changes
- `npm run build` - build the widget in production mode
- `npm test` - run the tests
- `npm start` - start the app in production mode after you've built it

### merkur.config.mjs

The [configuration file](/docs/merkur-config) for Merkur [CLI](/docs/merkur-cli)

### src

This folder contains the two entry points for your widget — `src/entries/client.js` and `src/entries/server.js`, which are predefined in the @merkur modules based on your chosen view library. You can create your own entries and override the default ones. In the `src/` folder you would store all code necessary for displaying the widget, such as components. Here is also the most important file `widget.js` which is your main file for your widget.

### server

The server folder contains assets, predefined config per environment, routes and most importantly the `app.js` file.

### server/config

Merkur uses [config](https://www.npmjs.com/package/config) module for hierarchical configurations for your widget.

### server/router

This contains individual [Express](https://expressjs.com/en/guide/routing.html) routes. The most important route is widgetAPI which defined widget API interface. 

### app.js

This contains a basic [Express](https://expressjs.com/) server with predefined middleware.
