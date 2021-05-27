import React from 'react';
import { shallow } from 'enzyme';

import {
  selectorToAttribute,
  SelectorIdentifierMap,
  WidgetWrapperComponent as WidgetWrapper,
} from '../WidgetWrapper';

describe('SelectorIdentifierMap', () => {
  it('should match snapshot', () => {
    expect(SelectorIdentifierMap).toMatchSnapshot();
  });
});

describe('selectorToAttribute()', () => {
  it.each([
    [null, {}],
    [undefined, {}],
    [0, {}],
    [false, {}],
    ['#container', { id: 'container' }],
    ['.container', { className: 'container' }],
    ['.e_dU.atm-list-ul.d_gX.container', { className: 'container' }],
    ['.e_dU#atm-list-ul...d_gX#d', { id: 'd' }],
    [
      '#main:first-child > div > div & pre .container',
      { className: 'container' },
    ],
  ])('should parse %j into %j', (input, expected) => {
    expect(selectorToAttribute(input)).toStrictEqual(expected);
  });
});

describe('WidgetWrapperComponent', () => {
  it('should render with SSR html primarily', () => {
    expect(
      shallow(
        <WidgetWrapper
          containerSelector=".container"
          html={'<div><h1>Hello world</h1></div>'}>
          <span>Fallback</span>
        </WidgetWrapper>
      )
    ).toMatchInlineSnapshot(`
      <div
        className="container"
        dangerouslySetInnerHTML={
          Object {
            "__html": "<div><h1>Hello world</h1></div>",
          }
        }
      />
    `);
  });

  it('should render with children', () => {
    expect(
      shallow(
        <WidgetWrapper containerSelector="#container" html={''}>
          <span>Fallback</span>
        </WidgetWrapper>
      )
    ).toMatchInlineSnapshot(`
      <div
        id="container"
      >
        <span>
          Fallback
        </span>
      </div>
    `);
  });

  it('should process complex selector correctly', () => {
    expect(
      shallow(
        <WidgetWrapper containerSelector="#main:first-child > div > div & pre .container">
          <span>Fallback</span>
        </WidgetWrapper>
      )
    ).toMatchInlineSnapshot(`
      <div
        className="container"
      >
        <span>
          Fallback
        </span>
      </div>
    `);
  });
});
