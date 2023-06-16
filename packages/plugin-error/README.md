# Merkur - plugin-error

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://travis-ci.com/mjancarik/merkur)
[![NPM package version](https://img.shields.io/npm/v/@merkur/plugin-error/latest.svg)](https://www.npmjs.com/package/@merkur/plugin-error)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/plugin-error/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`merkur/plugin-error` adds semi-automatic error handling to your Merkur widget: 

* Return a custom HTTP status based on thrown error
* Render valid JSON with error code and message
* Render an error page
* Run arbitrary code on error (e.g. to log/report the error)
* Catch unhandled promise errors


**[Full documentation for @merkur/plugin-error](https://merkur.js.org/docs/error-plugin).**

## About Merkur

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices(micro frontends). It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of six predefined template's library [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) and [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) but you can easily extend for others.
