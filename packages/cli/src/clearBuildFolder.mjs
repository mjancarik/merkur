import { rm } from 'node:fs/promises';

export async function clearBuildFolder({ merkurConfig }) {
  try {
    await rm(merkurConfig.widgetServer.buildFolder, {
      recursive: true,
      force: true,
    });
  } catch {} //eslint-disable-line no-empty
}
