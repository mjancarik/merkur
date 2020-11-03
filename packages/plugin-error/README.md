# Merkur - plugin-error

`merkur/plugin-error` adds semi-automatic error handling to your Merkur widget: 

* Return a custom HTTP status based on thrown error
* Render valid JSON with error code and message
* Render an error page
* Run arbitrary code on error (e.g. to log/report the error)
* Catch unhandled promise errors


**[Full documentation for @merkur/plugin-error](https://merkur.js.org/docs/error-plugin).**

## About Merkur

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices. It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of four predefined template's library [React](https://reactjs.org/), [Preact](https://preactjs.com/), [hyperHTML](https://viperhtml.js.org/hyper.html) and [µhtml](https://github.com/WebReflection/uhtml#readme) but you can easily extend for others.