import ErrorView from './ErrorView';
import Counter from '../components/Counter';
import WidgetContext from '../components/WidgetContext';

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

export default View;
