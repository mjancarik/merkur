import { render, act } from '@testing-library/preact';
import { useSelect, WIDGET_UPDATE_EVENT } from '../useSelect';
import { SelectProvider } from '../SelectProvider.jsx';

describe('useSelect', () => {
  let widget;
  let listeners;

  beforeEach(() => {
    listeners = {};
    widget = {
      state: { count: 1, value: 'foo' },
      on: jest.fn((event, cb) => {
        listeners[event] = cb;
      }),
      off: jest.fn((event, cb) => {
        if (listeners[event] === cb) delete listeners[event];
      }),
      emit: jest.fn((event) => {
        if (listeners[event]) listeners[event]();
      }),
    };
  });

  function TestComponent({ selector }) {
    const [selected] = useSelect(null, selector);
    return <div data-testid='selected'>{JSON.stringify(selected)}</div>;
  }

  it('should select state using selector', () => {
    const selector = (state) => ({ count: state.count });
    const { getByTestId } = render(
      <SelectProvider widget={widget}>
        <TestComponent selector={selector} />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ count: 1 }),
    );
  });

  it('should update when widget emits WIDGET_UPDATE_EVENT and state changes', () => {
    const selector = (state) => ({ count: state.count });
    const { getByTestId } = render(
      <SelectProvider widget={widget}>
        <TestComponent selector={selector} />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ count: 1 }),
    );

    act(() => {
      widget.state = { ...widget.state, count: 2 };
      widget.emit(WIDGET_UPDATE_EVENT);
    });

    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ count: 2 }),
    );
  });

  it('should not update if selector result is the same', () => {
    const selector = () => ({ static: 1 });
    const { getByTestId } = render(
      <SelectProvider widget={widget}>
        <TestComponent selector={selector} />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ static: 1 }),
    );

    act(() => {
      widget.state.count = 999;
      widget.emit(WIDGET_UPDATE_EVENT);
    });

    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ static: 1 }),
    );
  });

  it('should unsubscribe on unmount', () => {
    const selector = (state) => ({ count: state.count });
    const { unmount } = render(
      <SelectProvider widget={widget}>
        <TestComponent selector={selector} />
      </SelectProvider>,
    );
    const cb = listeners[WIDGET_UPDATE_EVENT];
    unmount();
    expect(widget.off).toHaveBeenCalledWith(WIDGET_UPDATE_EVENT, cb);
  });

  it('should support multiple selectors', () => {
    // useSelect will merge the results of both selectors
    function MultiSelectorComponent() {
      // selectors: count and value
      const [selected] = useSelect(
        null,
        (state) => ({ count: state.count }),
        (state) => ({ value: state.value }),
      );
      return <div data-testid='selected'>{JSON.stringify(selected)}</div>;
    }
    const { getByTestId } = render(
      <SelectProvider widget={widget}>
        <MultiSelectorComponent />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ count: 1, value: 'foo' }),
    );
    act(() => {
      widget.state = { count: 5, value: 'bar' };
      widget.emit(WIDGET_UPDATE_EVENT);
    });
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ count: 5, value: 'bar' }),
    );
  });

  it('should use data argument in selector', () => {
    function DataSelectorComponent({ data }) {
      // selector uses data.prop to select the corresponding state property
      const [selected] = useSelect(data, (state, data) => ({
        value: state[data.prop],
      }));
      return <div data-testid='selected'>{JSON.stringify(selected)}</div>;
    }
    const { getByTestId, rerender } = render(
      <SelectProvider widget={widget}>
        <DataSelectorComponent data={{ prop: 'count' }} />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ value: 1 }),
    );
    rerender(
      <SelectProvider widget={widget}>
        <DataSelectorComponent data={{ prop: 'value' }} />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ value: 'foo' }),
    );
  });

  it('should select state property based on data prop', () => {
    function DynamicSelectorComponent({ data }) {
      // selector uses data.key to select the corresponding state property
      const [selected] = useSelect(data, (state, data) => ({
        value: state[data.key],
      }));
      return <div data-testid='selected'>{JSON.stringify(selected)}</div>;
    }
    const { getByTestId, rerender } = render(
      <SelectProvider widget={widget}>
        <DynamicSelectorComponent data={{ key: 'count' }} />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ value: 1 }),
    );
    rerender(
      <SelectProvider widget={widget}>
        <DynamicSelectorComponent data={{ key: 'value' }} />
      </SelectProvider>,
    );
    expect(getByTestId('selected').textContent).toBe(
      JSON.stringify({ value: 'foo' }),
    );
  });
});
