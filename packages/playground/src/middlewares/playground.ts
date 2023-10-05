import path from 'path';
import express from 'express';
import ejs from 'ejs';
import sirv from 'sirv';

export type PlaygroundOptions = {
  widgetPath: string;
};

function applyOptionsDefaults(
  options: Partial<PlaygroundOptions>,
): PlaygroundOptions {
  return {
    widgetPath: '/widget',
    ...options,
  };
}

export function playground(options: Partial<PlaygroundOptions> = {}) {
  const { widgetPath } = applyOptionsDefaults(options);
  const router = express.Router();
  const template = ejs.compile(
    path.join(__dirname, '../../templates/index.ejs'),
  );

  router
    .use(
      '/@merkur/integration/',
      sirv(path.dirname(require.resolve('@merkur/integration')), {
        immutable: true,
        maxAge: 31536000,
      }),
    )
    .get('*', async (req, res, next) => {
      const url = new URL(
        `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      );

      try {
        const response = await fetch(`${url.origin}${widgetPath}`);
        const { html, ...widgetProperties } = await response.json();

        res.status(200).send(
          template({
            widgetProperties,
            html,
          }),
        );
      } catch (error) {
        next(error);
      }
    });

  return router;
}
