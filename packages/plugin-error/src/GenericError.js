export default class GenericError extends Error {
  constructor(message, params) {
    super(message);
    const { status = 404, ...otherParams } = params;

    this.name = 'Error';
    this.status = status;

    this._params = otherParams;
  }

  get params() {
    return this._params;
  }
}
