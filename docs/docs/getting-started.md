---
layout: docs
---

# Getting started

## Installation

We recommend creating a new [Mekur](site.homeUrl) widget using `@merkur/create-widget`, which sets up everything automatically for you. You can use one of three predefined template's library [react](https://reactjs.org/), [preact](https://preactjs.com/) and [hyperhtml](https://viperhtml.js.org/hyper.html) but you can easily add others.

```shell
npx @merkur/create-widget <name>
 
cd name
 
npm run dev // Point your browser at http://localhost:4444/
```

This will scaffold a new project in the `name` directory and start a server on [localhost:4444](http://localhost:4444/). Try editing the files to get a feel for how everything works.

<img class="responsive" src="{{ '/assets/images/hello-widget.png?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur - hello widget" />

## Widget structure

If you take a look inside the created widget, you'll see some files:

```shell
<name>
│   package.json
│   webpack.config.js
└───server
│   │   app.js
│   │   server.js
│   └───view
│   │    index.ejs
│   └───static
│   │   // static files for serving from server
└───src
│   │   style.css
│   │   widget.js
│   │   client.js
│   │   server.js
│   │
│   └───component
│       │   Counter.jsx
│       │   MerkurIcon.jsx
│       │   View.jsx
│       │   Welcome.jsx
│       │   WidgetDescription.jsx
```

You'll notice a few extra files for linter, babel and jest config.

### package.json

The package.json contains predefined dependencies and defines some of scripts:

- `npm run dev` - start the widget in development mode, and watch source files for changes
- `npm run build` - build the widget in production mode
- `npm test` - run the tests
- `npm start` - start the app in production mode after you've built it

### src

This contains the two entry points for your widget — src/client.js and src/server.js. Of course you can add other files and folders.

### server

The server folder contains assets, predefined `index.html` as index.ejs view and the most important `app.js` file.

### app.js

This contains normal [Express](https://expressjs.com/) server with predefined middlewares.
