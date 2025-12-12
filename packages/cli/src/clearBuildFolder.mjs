import { rm } from 'node:fs/promises';

export async function clearFolder(folderPath) {
  try {
    await rm(folderPath, {
      recursive: true,
      force: true,
    });
  } catch {} //eslint-disable-line no-empty
}

export async function clearBuildFolder({ merkurConfig }) {
  await clearFolder(merkurConfig.widgetServer.buildFolder);
}
