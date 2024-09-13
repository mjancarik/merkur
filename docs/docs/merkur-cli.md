---
layout: docs
title: Merkur CLI
---

# Merkur CLI

Merkur CLI for building your widget use [esbuild](https://esbuild.github.io/) tool which improve performance of development process and build tasks over [webpack](https://webpack.js.org/). The merkur CLi is configurable with [merkur.config.mjs]({{ '/docs/merkur-config' | relative_url }}) file which is in root of your project.

## Commands

- `merkur dev` - build your widget with with NODE_ENV = 'development' and with watch mode
- `merkur build` - build your widget with NODE_ENV = 'production'
- `merkur test` - run defined widget tests with NODE_ENV = 'test'
- `merkur start` - run widget server and playground server
- `merkur custom` - customize part of template (playground page)

## Custom playground template

At first run `merkur custom playground:body` command which create `body.ejs` file in your project in `/server/playground/templates` folder. Now you can modify playground page as you wish. 
