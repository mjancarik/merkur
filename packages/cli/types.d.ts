import type { BuildOptions } from 'esbuild';
import type { Request, Response } from '@types/express';

export interface CLIConfig {
  environment: string;
  isProduction: boolean;
  watch: boolean;
  writeToDisk: boolean;
  outFile: string;
  port: number;
  runTask: string[];
  devServerPort: number;
  projectFolder: string;
  cliFolder: string;
  buildFolder: string;
  staticFolder: string;
  staticPath: string;
  inspect: boolean;
  verbose: boolean;
}

export type Extend =
  | '@merkur/preact/cli'
  | '@merkur/svelte/cli'
  | '@merkur/uhtml/cli'
  | string
  | undefined;

export interface Task {
  name: 'es13' | 'es9' | 'node' | string;
  build: BuildOptions;
  [key: string]: any;
}

export interface DevServer {
  protocol: string;
  host: string;
  port: number;
  origin: string;
  staticPath: string;
  staticFolder: string;
}

export interface Playground {
  template: string;
  templateFolder: string;
  path: string;
  widgetHandler(req: Request, res: Response): Record<string, unknown>;
}

export interface SocketServer {
  protocol: string;
  host: string;
  port: number;
}

export interface WidgetServer {
  protocol: string;
  host: string;
  port: number;
  origin: string;
  staticFolder: string;
  staticPath: string;
  buildFolder: string;
  clusters: number;
}

export interface MerkurConfig {
  HMR: boolean;
  cliConfig: CLIConfig;
  extends: Extend[];
  task: {
    [key: string]: Task;
  };
  devServer: DevServer;
  defaultEntries: {
    client: string;
    server: string;
    [key: string]: string;
  };
  playground: Playground;
  socketServer: SocketServer;
  widgetServer: WidgetServer;
  onMerkurConfig: ({
    merkurConfig: MerkurConfig,
    cliConfig: CLIConfig,
  }) => Partial<MerkurConfig>;
  onCliConfig: ({ cliConfig: CLIConfig }) => Partial<CLIConfig>;
  onTaskBuild: ({
    definition: Task,
    build: BuildOptions,
    cliConfig: CLIConfig,
    merkurConfig: MerkurConfig,
  }) => Partial<BuildOptions>;
}

export function defineConfig({
  merkurConfig: MerkurConfig,
  cliConfig: CLIConfig,
}): Partial<MerkurConfig>;
