import GenericError from '../GenericError';

describe('GenericError', () => {
  it('should be able to create error instance', () => {
    const error = new GenericError('Error', {
      status: 500,
      reason: 'api_error',
    });

    expect(error).toBeInstanceOf(GenericError);
    expect(error.status).toBe(500);
    expect(error.params).toEqual(
      expect.objectContaining({
        reason: 'api_error',
      }),
    );
  });
});
