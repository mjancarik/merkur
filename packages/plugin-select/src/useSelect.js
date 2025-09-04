import { createSelector } from 'reselect';
import { useEffect, useRef, useState } from 'preact/hooks';

export const WIDGET_UPDATE_EVENT = 'widget:update';

let creatorOfStateSelector = createStateSelector;

export function setCreatorOfStateSelector(createStateSelector) {
  creatorOfStateSelector = createStateSelector;
}

export function useSelect(widget, data, ...selectors) {
  const stateSelector = useRef(creatorOfStateSelector(...selectors));
  const currentData = useRef(data);

  const resolveNewState = useRef(() => {
    return stateSelector.current(widget.state, currentData.current);
  });

  const [state, setState] = useState(resolveNewState.current());

  const afterChangeState = useRef(() => {
    const newState = resolveNewState.current();

    if (newState !== state) {
      setState(newState);
    }
  });

  }, [widget]);

  return [resolveNewState.current()];
}

export function createStateSelector(...selectors) {
  const derivedState = createSelector(
    ...selectors.map((selector) => {
      return (state, data) => {
        return selector(state, data);
      };
    }),
    (...rest) => Object.assign({}, ...rest),
  );

  const passStateOnChange = (() => {
    let memoizedSelector = null;
    let selectorFunctions = null;
    let memoizedState = null;

    return (state) => {
      if (
        Object.keys(state || {}).length !==
        Object.keys(memoizedState || {}).length
      ) {
        memoizedSelector = null;
        selectorFunctions = null;
      }
      memoizedState = state;

      if (!selectorFunctions) {
        selectorFunctions = Object.keys(state).map((key) => {
          return (currentState) => {
            return currentState[key] || false;
          };
        });
      }

      if (!memoizedSelector) {
        memoizedSelector = createSelector(...selectorFunctions, () => {
          return memoizedState;
        });
      }

      return memoizedSelector(state);
    };
  })();

  return createSelector(derivedState, passStateOnChange);
}
