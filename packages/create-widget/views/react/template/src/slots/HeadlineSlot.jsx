import React from 'react';
import Welcome from '../component/Welcome';
import WidgetDescription from '../component/WidgetDescription';
import WidgetContext from '../component/WidgetContext';

async function headlineSlotFactory() {
  return {
    name: 'headline',
    View: HeadlineSlot,
    containerSelector: '.headline-view',
  };
}

function HeadlineSlot(widget) {
  if (widget.error && widget.error.status) {
    return null;
  }

  return (
    <WidgetContext.Provider value={widget}>
      <div className="merkur__headline">
        <div className="merkur__view">
          <Welcome />
          <h3>Current count: {widget.state.counter}</h3>
          <WidgetDescription name={widget.name} version={widget.version} />
        </div>
      </div>
    </WidgetContext.Provider>
  );
}

export { headlineSlotFactory };
export default HeadlineSlot;
