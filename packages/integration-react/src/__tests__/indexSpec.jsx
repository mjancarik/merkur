import * as module from '../index';

describe('module @merkur/integration-react', () => {
  it('should have interface', () => {
    expect(module).toMatchInlineSnapshot(`
      {
        "MerkurSlot": [Function],
        "MerkurWidget": [Function],
      }
    `);
  });
});
