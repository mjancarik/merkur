import { bindWidgetToFunctions } from '@merkur/core';

import { print, visit, stripIgnoredCharacters } from 'graphql';

import GraphQLError from './error/GraphQLError';
import UnauthorizedError from './error/UnauthorizedError';

const TYPENAME_FIELD = {
  kind: 'Field',
  name: {
    kind: 'Name',
    value: '__typename',
  },
};

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

function setEndpointUrl(widget, url) {
  widget.$in.graphqlClient.endpointUrl = url;
}

function setEntityClasses(widget, entityClasses) {
  widget.$in.graphqlClient.entityClasses = buildTypeToEntityMap(entityClasses);
}

function graphqlClientPlugin() {
  return {
    async setup(widget) {
      widget = {
        ...graphqlClientAPI(),
        ...widget,
      };

      widget.$in.graphqlClient = {
        endpointUrl: '',
        entityClasses: {},
      };

      return widget;
    },
    async create(widget) {
      if (ENV === DEV && !widget.$in.httpClient) {
        throw new Error(
          'You must install missing plugin: npm i @merkur/plugin-http-client'
        );
      }

      bindWidgetToFunctions(widget, widget.graphql);

      return widget;
    },
  };
}

function graphqlClientAPI() {
  return {
    graphql: {
      async request(widget, operation, variables = {}, options = {}) {
        const { endpointUrl, entityClasses } = widget.$in.graphqlClient;
        const { headers = {}, body = {}, ...restOptions } = options;

        operation = addTypenameToSelections(operation);

        const { response } = await widget.http.request({
          url: endpointUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: {
            query: stripIgnoredCharacters(print(operation)),
            variables,
            ...body,
          },
          ...restOptions,
        });

        const { errors, data = {} } = response.body;
        if (errors) {
          if (
            Array.isArray(errors) &&
            errors.some((error) => error.status === 'unauthorized')
          ) {
            return Promise.reject(
              new UnauthorizedError(`Unauthorized Error`, { errors, data })
            );
          }

          return Promise.reject(
            new GraphQLError(`Api Error`, { errors, data })
          );
        }

        return processResponseData(data, entityClasses);
      },
    },
  };
}

function buildTypeToEntityMap(entityClasses) {
  const map = {};

  entityClasses.forEach((entityClass) => {
    let { entityType } = entityClass;

    if (!Array.isArray(entityType)) {
      entityType = [entityType];
    }

    entityType.forEach((type) => (map[type] = entityClass));
  });

  return map;
}

function processResponseData(data, entityClasses) {
  const processedData = {};

  if (typeof data === 'string') {
    return data;
  }
  Object.entries(data).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      value = value.map((node) => processResponseData(node, entityClasses));
    } else if (typeof value === 'object' && value !== null) {
      value = processResponseData(value, entityClasses);
    }

    processedData[field] = value;
  });

  const type = processedData.__typename;
  if (!type || !entityClasses[type]) {
    return processedData;
  }

  return Reflect.construct(entityClasses[type], [processedData]);
}

function addTypenameToSelections(document) {
  return visit(document, {
    SelectionSet: {
      enter(node, _key, parent) {
        // Don't add __typename to OperationDefinitions.
        if (parent && parent.kind === 'OperationDefinition') {
          return;
        }

        // No changes if no selections.
        const { selections } = node;
        if (!selections) {
          return;
        }

        // If selections already have a __typename, or are part of an
        // introspection query, do nothing.
        const skip = selections.some(
          (selection) =>
            selection.kind === 'Field' &&
            (selection.name.value === '__typename' ||
              selection.name.value.lastIndexOf('__', 0) === 0)
        );

        if (skip) {
          return;
        }

        // If this SelectionSet is @export-ed as an input variable, it should
        // not have a __typename field (see issue #4691).
        if (
          parent.kind === 'Field' &&
          parent.directives &&
          parent.directives.some((d) => d.name.value === 'export')
        ) {
          return;
        }

        // Create and return a new SelectionSet with a __typename Field.
        return Object.assign({}, node, {
          selections: [...selections, TYPENAME_FIELD],
        });
      },
    },
  });
}

export {
  graphqlClientPlugin,
  setEndpointUrl,
  setEntityClasses,
  GraphQLError,
  UnauthorizedError,
};
