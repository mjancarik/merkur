---
sidebar_position: 1
title: Introduction
description: Introduction to Merkur - a tiny, fast, and modular front-end library
---

# Introduction to Merkur

Merkur is a tiny, fast, and modular front-end library for creating widgets in pure JavaScript. It allows you to build modern applications with server-side rendering, easy integration, and a small footprint.

## What is Merkur?

Merkur widget can be a small button, a section of a page, or an entire page of your website. A common scenario: you have an existing application and need to add a new block. You could add to the existing monolithic system... or you you can create a merkur widget, a reusable front-end microservice.

Consider this layout:

![Merkur - concept](/img/merkur-concept.jpg)

The `App container` can be an SPA application written with VueJS, Angular or React. It can also be a MPA application written with Symphony or Django. You can [integrate](/docs/integration-with-app) Merkur widget with any web application. 

You may use more than one widget on a page. Here we use a `Feed` widget and a `Subcribe` widget. Both can be written with the same framework, or they can use completely different technologies. You can also use only plain Javascript native browser APIs, leveraging the capabilities of modern browsers.

## Features

- **Modular architecture**: Use only what you need
- **Multiple view libraries**: Choose from Preact, Svelte, μhtml, or vanilla JS
- **Server-side rendering**: Built-in with strong SEO capabilities
- **Integration-friendly**: Easily integrate into any tech stack
- **Plugin system**: Extend functionality as needed

## Quick Start

If you want to get started with Merkur right away, check our [Getting Started](/docs/getting-started) guide.

```bash
cd my-website
npm run start
```

The `cd` command changes the directory you're working with. In order to work with your newly created Docusaurus site, you'll need to navigate the terminal there.

The `npm run start` command builds your website locally and serves it through a development server, ready for you to view at http://localhost:3000/.

Open `docs/intro.md` (this page) and edit some lines: the site **reloads automatically** and displays your changes.
