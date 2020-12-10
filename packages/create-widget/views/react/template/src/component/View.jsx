import React from 'react';
import WidgetContext from './WidgetContext';
import Welcome from './Welcome';
import WidgetDescription from './WidgetDescription';
import Counter from './Counter';
import ErrorView from './ErrorView';

export default function View(widget) {
  if (widget.error && widget.error.status) {
    return <ErrorView error={widget.error} />;
  }

  return (
    <WidgetContext.Provider value={widget}>
      <div className="merkur__page">
        <div className="merkur__headline">
          <div className="merkur__view">
            <Welcome />
            <WidgetDescription name={widget.name} version={widget.version} />
          </div>
        </div>
        <div className="merkur__view">
          <Counter counter={widget.state.counter} />
        </div>
      </div>
    </WidgetContext.Provider>
  );
}
