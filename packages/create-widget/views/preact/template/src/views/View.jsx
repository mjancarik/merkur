import { h } from 'preact'; // eslint-disable-line no-unused-vars
import WidgetContext from '../components/WidgetContext';
import Counter from '../components/Counter';
import ErrorView from './ErrorView';
import { headlineSlotFactory } from '../slots/HeadlineSlot';

async function viewFactory(widget) {
  const slots = (await Promise.all([headlineSlotFactory(widget)])).reduce(
    (acc, cur) => {
      acc[cur.name] = cur;

      return acc;
    },
    {}
  );

  return {
    View,
    slots,
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
