import path from 'node:path';
import fs from 'node:fs';
import ejs from 'ejs';
import chalk from 'chalk';

import compression from 'compression';
import express from 'express';

import { createLogger } from './logger.mjs';
import { COMMAND_NAME } from './commands/constant.mjs';

function escapeToJSON(object) {
  return JSON.stringify(object).replace(/<\/script/gi, '<\\/script');
}

function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export async function runDevServer({ context, merkurConfig, cliConfig }) {
  const logger = createLogger('devServer', cliConfig);
  const { protocol, host, port, staticPath, staticFolder, origin } =
    merkurConfig.devServer;
  const {
    template,
    templateFolder,
    serverTemplateFolder,
    path: playgroundPath,
    widgetHandler,
  } = merkurConfig.playground;
  const { cliFolder, command, writeToDisk } = cliConfig;

  return new Promise((resolve, reject) => {
    const app = express();

    const server = app
      .use((req, res, next) => {
        const headerOrigin = req.get('Origin');
        // Allow cors
        if (headerOrigin) {
          res.header('Access-Control-Allow-Origin', `${origin}`);
          res.header('Access-Control-Allow-Headers', '*');
        }

        next();
      })
      .use(compression())
      .get(
        playgroundPath,
        asyncMiddleware(async (req, res) => {
          const isDevCommand = command === COMMAND_NAME.DEV;

          const widgetProperties = await widgetHandler(req, res, {
            context,
            merkurConfig,
            cliConfig,
          });

          // TODO refactor
          if (isDevCommand) {
            const { widgetServer } = merkurConfig;
            widgetProperties.assets = widgetProperties?.assets?.map((asset) => {
              if (typeof asset.source === 'string') {
                asset.source = asset.source.replace(
                  widgetServer.origin,
                  origin,
                );

                if (asset.type.includes('inline')) {
                  const assetPath = asset.source.replace(origin, '');
                  if (writeToDisk) {
                    // widget Server Handle right inline
                    // asset.source = fs.readFileSync(
                    //   path.join(
                    //     path.resolve(projectFolder, buildFolder),
                    //     assetPath,
                    //   ),
                    //   'utf8',
                    // );
                  } else {
                    asset.source = context.memory[assetPath]?.text;
                  }
                }

                return asset;
              }

              if (Object.keys(asset.source) !== 0) {
                Object.keys(asset.source).map((assetVersion) => {
                  if (typeof asset.source[assetVersion] === 'string') {
                    asset.source[assetVersion] = asset.source[
                      assetVersion
                    ].replace(widgetServer.origin, origin);
                  }

                  if (asset.type.includes('inline')) {
                    const assetPath = asset.source[assetVersion].replace(
                      origin,
                      '',
                    );
                    if (writeToDisk) {
                      // widget Server Handle right inline
                      // asset.source[assetVersion] = fs.readFileSync(
                      //   path.join(
                      //     path.resolve(projectFolder, buildFolder),
                      //     assetPath,
                      //   ),
                      //   'utf8',
                      // );
                    } else {
                      asset.source = context.memory[assetPath]?.text;
                    }
                  }
                });
              }

              return asset;
            });
          }

          const devClient = isDevCommand
            ? fs.readFileSync(
                path.resolve(`${cliFolder}/../lib/devClient.mjs`),
                'utf8',
              )
            : '';

          const playgroundTemplate = ejs.compile(
            fs.readFileSync(template, 'utf8'),
            {
              views: [
                serverTemplateFolder,
                path.dirname(template),
                templateFolder,
              ],
            },
          );

          const { html, assets, ...restProperties } = widgetProperties;

          res.status(200).send(
            playgroundTemplate({
              widgetProperties: restProperties,
              assets,
              merkurConfig,
              devClient,
              html,
              escapeToJSON,
            }),
          );
        }),
      )
      .use(staticPath, express.static(staticFolder))
      .use((req, res) => {
        const key = req.path;
        const record = context.memory[key];

        if (key.endsWith('.js')) {
          res.type('js');
        }

        if (key.endsWith('.css')) {
          res.type('css');
        }

        res.status(record ? 200 : 404).send(record?.text);
      })
      .use((error, req, res, next) => {
        if (res.headersSent) {
          return next(error);
        }

        logger.error(error);
        // TODO send html page with preview of error for better DX
        res.status(error?.status ?? 500).json({
          error: {
            message: `Something is wrong with the @merkur/cli/devServer: ${error.message}`,
            stack: error.stack,
          },
        });
      })
      .listen({ port }, () => {
        logger.info(`Playground: ${chalk.green(`${protocol}//${host}`)}`);
        resolve(app);
      });

    context.server.devServer = server;

    server.on('error', (error) => {
      reject(error);
    });
  });
}
