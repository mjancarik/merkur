import { bindWidgetToFunctions } from '@merkur/core';

import { print, visit } from 'graphql';

const TYPENAME_FIELD = {
  kind: 'Field',
  name: {
    kind: 'Name',
    value: '__typename',
  },
};

export function setEndpointUrl(widget, url) {
  widget.$in.graphqlClient.endpointUrl = url;
}

export function setEntityClasses(widget, entityClasses) {
  widget.$in.graphqlClient.entityClasses = buildTypeToEntityMap(entityClasses);
}

export function graphqlClientPlugin() {
  return {
    async setup(widget) {
      if (!widget.http || typeof widget.http.request !== 'function') {
        throw new Error(
          '@merkur/plugin-graphql-client requires that @merkur/plugin-http-client to be set up.'
        );
      }
      widget = {
        ...graphqlClientAPI(),
        ...widget,
      };

      widget.$in.graphqlClient = {
        endpointUrl: '',
        entityClasses: {},
      };

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

        const { response } = await widget.http.request({
          url: endpointUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: {
            query: print(addTypenameToSelections(operation)),
            variables,
            ...body,
          },
          ...restOptions,
        });

        const { errors, data = {} } = response.body;
        if (errors) {
          throw new Error(`GraphQL Error`, { errors, data });
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

  const type = data.__typename;
  if (!type || !entityClasses[type]) {
    return data;
  }

  return Reflect.construct(entityClasses[type], [data]);
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
