import { rmdir } from 'node:fs/promises';

export async function clearBuildFolder({ merkurConfig }) {
  try {
    await rmdir(merkurConfig.widgetServer.buildFolder, { recursive: true });
  } catch (error) {
    console.warn(error);
  }
}
