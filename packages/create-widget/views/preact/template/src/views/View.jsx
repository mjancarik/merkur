import { createViewFactory } from '@merkur/core';

import ErrorView from './ErrorView';
import Counter from '../components/Counter';
import WidgetContext from '../components/WidgetContext';
import { headlineSlotFactory } from '../slots/HeadlineSlot';

const viewFactory = createViewFactory(() => ({
  View,
  slotFactories: [headlineSlotFactory],
}));

function View(widget) {
  if (widget.error && widget.error.status) {
    return <ErrorView error={widget.error} />;
  }

  return (
    <WidgetContext.Provider value={widget}>
      <div className='merkur__page'>
        <div className='merkur__view'>
          <Counter counter={widget.state.counter} />
        </div>
      </div>
    </WidgetContext.Provider>
  );
}

export { viewFactory };
export default View;
