import { shallow } from 'enzyme';
import { createMerkur, removeMerkur } from '@merkur/core';
import React from 'react';
import MerkurComponet from '../MerkurComponent';

describe('Merkur component', () => {
  let widgetProperties = null;
  let wrapper = null;

  beforeEach(() => {
    createMerkur();

    widgetProperties = {
      name: 'my-widget',
      version: '0.0.1',
      props: {},
      state: {
        counter: 0,
      },
      assets: [
        {
          type: 'script',
          source: 'http://localhost:4444/static/widget-client.js',
        },
        {
          type: 'stylesheet',
          source: 'http://localhost:4444/static/widget-client.css',
        },
      ],
      html: '<div class="merkur__page"></div>',
    };
  });

  afterEach(() => {
    removeMerkur();
  });

  it('should render fallback view for not defined widgetProperties', () => {
    wrapper = shallow(
      <MerkurComponet>
        <span>Fallback</span>
      </MerkurComponet>
    );

    expect(wrapper).toMatchInlineSnapshot(`
      <span>
        Fallback
      </span>
    `);
  });

  it('should render merkur component for defined widgetProperties', () => {
    spyOn(MerkurComponet.prototype, '_loadAssets').and.stub();

    wrapper = shallow(
      <MerkurComponet widgetProperties={widgetProperties}>
        <span>Fallback</span>
      </MerkurComponet>
    );

    expect(wrapper).toMatchInlineSnapshot(`
      <Fragment>
        <link
          href="http://localhost:4444/static/widget-client.css"
          key="1"
          rel="stylesheet"
        />
        <div
          className="merkur__container"
          dangerouslySetInnerHTML={
            Object {
              "__html": "<div class=\\"merkur__page\\"></div>",
            }
          }
        />
      </Fragment>
    `);
  });
});
