import fs from 'fs';
import path from 'path';
import { compile } from 'ejs';
import { build, createServer as createViteServer } from 'vite';
import { resolveMerkurConfig } from '../utils/parser.js';
import { fileURLToPath } from 'url';
import express from 'express';
import { MerkurConfig } from '../types.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const template = compile(
  fs.readFileSync(
    path.resolve(__dirname, '../../templates/index.ejs'),
    'utf-8',
  ),
);

export async function createServer(config: MerkurConfig) {
  const app = express();

  // Run build watch for server bundle
  const t = await build({
    ssr: {
      target: 'node',
      format: 'cjs',
      external: ['@merkur/core', '@merkur/plugin-error'],
    },
    build: {
      ssr: true,
      ssrEmitAssets: true,
      watch: {},
      rollupOptions: {
        input: {
          widget: '/src/server.js',
        },
      },
    },
    plugins: config?.plugins ?? [],
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    plugins: config?.plugins ?? [],
  });

  app
    .use(vite.middlewares)
    .use('*', async (req, res) => {
      const url = req.originalUrl;

      try {
        // Make request to widget
        const data = await (
          await fetch('http://localhost:4444/widget?counter=20')
        ).json();

        // 1. Read index.html
        // let template = fs.readFileSync(
        //   path.resolve(__dirname, 'index.html'),
        //   'utf-8',
        // );
        console.log(data, template);
        let html = template({ widget: data });

        // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
        //    and also applies HTML transforms from Vite plugins, e.g. global
        //    preambles from @vitejs/plugin-react
        html = await vite.transformIndexHtml(url, html);
        console.log(html);

        // 6. Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        console.log(e);
        // vite.ssrFixStacktrace(e);
        // next(e);
      }
    })
    .listen(5173);
}

export async function dev() {
  const config = await resolveMerkurConfig();

  // const server = await createServer({
  //   configFile: false,
  //   root: process.cwd(),
  //   server: {
  //     port: 1337,
  //   },
  //   // Works on build only
  //   // plugins: [
  //   //   { name: 'html', transformIndexHtml: () => HTML },
  //   //   ...(config?.plugins ?? []),
  //   // ],
  //   plugins: config?.plugins ?? [],
  // });

  await createServer(config);

  // await server.listen();
  // server.printUrls();
}
