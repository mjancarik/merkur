import { h } from 'preact'; // eslint-disable-line no-unused-vars
import Welcome from '../components/Welcome';
import WidgetDescription from '../components/WidgetDescription';
import WidgetContext from '../components/WidgetContext';

async function headlineSlotFactory() {
  return {
    name: 'headline',
    View: HeadlineSlot,
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
