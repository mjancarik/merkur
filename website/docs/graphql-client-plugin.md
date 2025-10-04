---
sidebar_position: 14
title: GraphQL Client Plugin
description: Learn about the GraphQL Client plugin for making GraphQL API requests in Merkur
---

# GraphQL client plugin

The GraphQL client plugin adds `graphql` (or any name you chose) property to your widget with a `request` method. Under the hood this plugin uses [HTTP Client plugin](/docs/http-client-plugin)

## Installation

We must install `@merkur/plugin-http-client` and `@merkur/plugin-graphql-client` and then register both plugins to `$plugins` property of the widget.

```javascript
// ./src/widget.js
import { httpClientPlugin } from '@merkur/plugin-http-client';
import { graphqlClientPlugin } from '@merkur/plugin-graphql-client';

export const widgetProperties = {
  name,
  version,
  $plugins: [httpClientPlugin, graphqlClientPlugin],
  // ... other properties
};
```

After that we have an `graphql.request` method available on the widget.

Or you can return the function with a specific name. This is handy if you want to use more then one plugin, for example, with a different API end point.


```javascript
// ./src/widget.js
import { httpClientPlugin } from '@merkur/plugin-http-client';
import { graphqlClientPlugin } from '@merkur/plugin-graphql-client';

const gqlPluginOne = () => graphqlClientPlugin('graphqlOne');
const gqlPluginTwo = () => graphqlClientPlugin('graphqlTwo');

export const widgetProperties = {
  name,
  version,
  $plugins: [httpClientPlugin, gqlPluginOne, gqlPluginTwo],
  // ... other properties
};
```

After than we have an `graphqlOne.request` and `graphqlTwo.request` method available.

We must add graphql loader from `@merkur/plugin-graphql-client/webpack` to webpack config. To add support for importing `.graphql/.gql` files.

```javascript
const { applyGraphqlLoader } = require('@merkur/plugin-graphql-client/webpack');
.
.
module.exports = createLiveReloadServer().then(() =>
  Promise.all(
    [
      pipe(
        .
        applyGraphqlLoader
.
.
```

We can set GraphQL endpoint URL with `setEndpointUrl` method from `@merkur/plugin-graphql-client` and set default request config with `setDefaultConfig` method from `@merkur/plugin-http-client`.

Method `setEndpointUrl` third parameter takes the name of the given graphql API. (For example 'graphqlOne' and 'graphqlTwo')

```javascript
// ./src/widget.js
import { setEndpointUrl } from '@merkur/plugin-graphql-client';
import { setDefaultConfig, getDefaultTransformers} from '@merkur/plugin-http-client';

export const widgetProperties = {
  name,
  version,
  bootstrap(widget) {
    setEndpointUrl(widget, 'https://api.localhost/graphql');
    setDefaultConfig(widget,
    {
      // ...
    });
  }
};
```

## Methods

### request

- `operation` - GraphQL AST object
- `variables` - optional variables used in operation
- `options` - @merkur/plugin-http-client request options


```javascript
import UserQuery from './graphql/query/User.gql';

try {
  const { response, request } = await widget.graphql.request(
    UserQuery,
    { userId: 434 },
    { credentials: 'omit' }
  );

  const { id, name } = response.user;
  // ...

} catch(error) {
   // ...
}
```

## Entities

You can register classes that will be instantiated with data for specific GraphQL Node. For that purpouse import `setEntityClasses` method from `@merkur/plugin-graphql-client`.

Method `setEntityClasses` third parameter is name of given graphql API. (For example 'graphqlOne' and 'graphqlTwo')

```javascript
// ./src/graphql/entity/UserEntity.js
export default class UserEntity {
  static entityType = 'UserNode';

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```javascript
// ./src/widget.js
import { setEntityClasses } from '@merkur/plugin-graphql-client';
import UserEntity from './graphql/entity/UserEntity';

export const widgetProperties = {
  name,
  version,
  bootstrap(widget) {
    setEndpointUrl(widget, 'https://api.localhost/graphql');
    setEntityClasses(widget, [UserEntity]);
  }
};
```

You can also map single entity to multiple nodes by specifying `entityType` as an array.

```javascript
// ./src/graphql/entity/ConnectionEntity.js
export default class ConnectionEntity {
  static entityType = ['UserConnection', 'RoleConnection'];

  // ...
}
```
