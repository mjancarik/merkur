import Welcome from '../components/Welcome';
import WidgetContext from '../components/WidgetContext';
import WidgetDescription from '../components/WidgetDescription';

function HeadlineSlot(widget) {
  if (widget.error && widget.error.status) {
    return null;
  }

  return (
    <WidgetContext.Provider value={widget}>
      <div className='merkur__headline'>
        <div className='merkur__view'>
          <Welcome />
          <h3>Current count: {widget.state.counter}</h3>
          <WidgetDescription name={widget.name} version={widget.version} />
        </div>
      </div>
    </WidgetContext.Provider>
  );
}

export default HeadlineSlot;
