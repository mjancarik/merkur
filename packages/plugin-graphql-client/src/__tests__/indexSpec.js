import { createMerkurWidget } from '@merkur/core';
import {
  graphqlClientPlugin,
  setEndpointUrl,
  setEntityClasses,
} from '../index';
import { httpClientPlugin } from '@merkur/plugin-http-client';
import { componentPlugin } from '@merkur/plugin-component';
import gql from 'graphql-tag';
import UnauthorizedError from '../error/UnauthorizedError';
import GraphQLError from '../error/GraphQLError';
class FooEntity {
  constructor(data) {
    Object.assign(this, data);
  }
  static get entityType() {
    return 'FooNode';
  }
}

describe('createWidget method with graphql client plugin', () => {
  let widget = null;
  let Response = null;
  let query = gql`
    query BasicQuery($id: ID!) {
      basic(id: $id) {
        foo
      }
    }
  `;

  beforeEach(async () => {
    widget = await createMerkurWidget({
      $plugins: [componentPlugin, httpClientPlugin, graphqlClientPlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1,
        containerSelector: '.container',
      },
      assets: [
        {
          type: 'script',
          source: 'http://www.example.com/static/1.0.0/widget.js',
        },
      ],
    });

    setEndpointUrl(widget, 'http://localhost:4444');
    setEntityClasses(widget, [FooEntity]);

    Response = {
      json() {
        return Promise.resolve({ data: 'text' });
      },
      ok: true,
      headers: {
        get() {
          return 'application/json';
        },
      },
      status: 200,
    };
  });

  it('should create empty widget', async () => {
    expect(widget).toMatchInlineSnapshot(`
{
  "$dependencies": {
    "AbortController": [Function],
    "fetch": [Function],
  },
  "$external": {
    "AbortController": [Function],
    "fetch": [Function],
  },
  "$in": {
    "component": {
      "isHydrated": false,
      "isMounted": false,
      "lifeCycle": {
        "bootstrap": undefined,
        "info": undefined,
        "load": undefined,
        "mount": undefined,
        "unmount": undefined,
        "update": undefined,
      },
      "resolvedViews": Map {},
      "suspendedTasks": [],
    },
    "graphqlClient": {
      "endpointUrl": "http://localhost:4444",
      "entityClasses": {
        "FooNode": [Function],
      },
    },
    "httpClient": {
      "defaultConfig": {
        "headers": {},
        "method": "GET",
        "query": {},
        "timeout": 15000,
        "transformers": [
          {
            "transformRequest": [Function],
            "transformResponse": [Function],
          },
          {
            "transformRequest": [Function],
          },
          {
            "transformRequest": [Function],
            "transformResponse": [Function],
          },
        ],
      },
    },
  },
  "$plugins": [
    {
      "create": [Function],
      "setup": [Function],
    },
    {
      "create": [Function],
      "setup": [Function],
    },
    {
      "create": [Function],
      "setup": [Function],
    },
  ],
  "assets": [
    {
      "source": "http://www.example.com/static/1.0.0/widget.js",
      "type": "script",
    },
  ],
  "bootstrap": [Function],
  "containerSelector": null,
  "create": [Function],
  "graphql": {
    "request": [Function],
  },
  "http": {
    "request": [Function],
  },
  "info": [Function],
  "load": [Function],
  "mount": [Function],
  "name": "my-widget",
  "props": {
    "containerSelector": ".container",
    "param": 1,
  },
  "setProps": [Function],
  "setState": [Function],
  "setup": [Function],
  "slot": {
    "AbortController": [Function],
    "fetch": [Function],
  },
  "state": {},
  "unmount": [Function],
  "update": [Function],
  "version": "1.0.0",
}
`);
  });
  describe('request method', () => {
    beforeEach(() => {
      widget.$dependencies.fetch = jest.fn(() => Promise.resolve(Response));
    });

    it('should make request', async () => {
      await widget.graphql.request(query, {
        id: 3,
      });
      expect(widget.$dependencies.fetch).toHaveBeenCalled();
    });

    it('should add __typename to query', async () => {
      await widget.graphql.request(query, {
        id: 3,
      });
      expect(widget.$dependencies.fetch.mock.calls[0][1].body).toBe(
        '{"query":"query BasicQuery($id:ID!){basic(id:$id){foo __typename}}","variables":{"id":3}}',
      );
    });

    it('should throw unauthorize error', async () => {
      Response = {
        ...Response,
        json() {
          return Promise.resolve({
            errors: [{ status: 'unauthorized' }],
            data: { foo: 'text error', __typename: 'FooNode' },
          });
        },
      };
      try {
        await widget.graphql.request(query, {
          id: 3,
        });
      } catch (error) {
        expect(widget.$dependencies.fetch).toHaveBeenCalled();
        expect(error).toBeInstanceOf(UnauthorizedError);
      }
    });

    it('should throw Api error', async () => {
      Response = {
        ...Response,
        json() {
          return Promise.resolve({
            errors: [{ status: 'error' }],
            data: { foo: 'text error', __typename: 'FooNode' },
          });
        },
      };
      try {
        await widget.graphql.request(query, {
          id: 3,
        });
      } catch (error) {
        expect(widget.$dependencies.fetch).toHaveBeenCalled();
        expect(error).toBeInstanceOf(GraphQLError);
      }
    });

    it('should construct FooEntity instance', async () => {
      Response = {
        ...Response,
        json() {
          return Promise.resolve({
            data: { foo: 'text', __typename: 'FooNode' },
          });
        },
      };
      const data = await widget.graphql.request(query, {
        id: 4,
      });
      expect(widget.$dependencies.fetch).toHaveBeenCalled();
      expect(data).toStrictEqual(
        new FooEntity({ foo: 'text', __typename: 'FooNode' }),
      );
    });
  });
});
