import * as module from '../index';

describe('module @merkur/integration-react', () => {
  it('should have interface', () => {
    expect(module).toMatchInlineSnapshot(`
      Object {
        "MerkurComponent": [Function],
        "MerkurSlot": [Function],
      }
    `);
  });
});
