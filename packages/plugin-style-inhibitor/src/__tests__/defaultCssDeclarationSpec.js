import defaultCssDeclaration from '../defaultCssDeclaration';

describe('defaultCssDeclaration', () => {
  it('should match snapshot', () => {
    expect(defaultCssDeclaration).toMatchSnapshot();
  });
});
