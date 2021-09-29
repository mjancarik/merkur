import Counter from '../components/Counter';
import WidgetContext from '../components/WidgetContext';
import { headlineSlotFactory } from '../slots/HeadlineSlot';
import ErrorView from './ErrorView';

async function viewFactory(widget) {
  const slot = (await Promise.all([headlineSlotFactory(widget)])).reduce(
    (acc, cur) => {
      acc[cur.name] = cur;

      return acc;
    },
    {}
  );

  return {
    View,
    slot,
  };
}

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
