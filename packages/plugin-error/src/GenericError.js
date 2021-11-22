import ExtensibleError from './ExtensibleError';

export default class GenericError extends ExtensibleError {
  constructor(message, params) {
    super(message);
    const { status = 500, ...otherParams } = params;

    this.name = 'Error';
    this.status = status;

    this._params = otherParams;
  }

  get params() {
    return this._params;
  }
}
