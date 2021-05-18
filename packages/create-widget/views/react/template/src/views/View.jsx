import React from 'react';
import WidgetContext from '../component/WidgetContext';
import Counter from '../component/Counter';
import ErrorView from '../component/ErrorView';
import { headlineSlotFactory } from '../slots/HeadlineSlot';

async function viewFactory(widget) {
  return {
    View: View,
    containerSelector: '.merkur-view',
    slots: await Promise.all([headlineSlotFactory(widget)]),
  };
}

function View(widget) {
  if (widget.error && widget.error.status) {
    return <ErrorView error={widget.error} />;
  }

  return (
    <WidgetContext.Provider value={widget}>
      <div className="merkur__page">
        <div className="merkur__view">
          <Counter counter={widget.state.counter} />
        </div>
      </div>
    </WidgetContext.Provider>
  );
}

export { viewFactory };
export default View;
