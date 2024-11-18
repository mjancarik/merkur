import fs from 'node:fs/promises';

export function excludeVendorsFromSourceMapPlugin() {
  return {
    name: 'excludeVendorsFromSourceMapPlugin',
    setup(build) {
      build.onLoad({ filter: /\/node_modules\/.*\.js?$/ }, async (args) => {
        const contents = await fs.readFile(args.path, { encoding: 'utf8' });

        return {
          contents:
            contents +
            '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==',
          loader: 'default',
        };
      });
    },
  };
}
