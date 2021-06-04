import {
  Merkur,
  Plugin,
  RegisterFunction,
  CreateFunction,
  Widget,
} from './types';
import { isFunction } from './utils';

const register: RegisterFunction = ({ name, version, createWidget }) => {
  const merkur = getMerkur();

  merkur.$in.widgetFactory[name + version] = createWidget;
};

const create: CreateFunction = (
  widgetProperties = {
    name: '',
    version: '',
  }
) => {
  const merkur = getMerkur();
  const { name, version } = widgetProperties;
  const factory = merkur.$in.widgetFactory[name + version] as CreateFunction;

  if (!isFunction(factory)) {
    throw new Error(
      `The widget with defined name and version "${
        name + version
      }" is not defined.`
    );
  }

  return factory(widgetProperties) as Promise<Widget>;
};

export function createMerkur(
  { $plugins }: { $plugins: Array<Plugin> } = { $plugins: [] }
): Merkur {
  const merkur = getMerkur();

  $plugins.forEach((plugin) => {
    if (plugin && isFunction(plugin.setup)) {
      plugin.setup(merkur);
    }
  });

  return merkur;
}

export function removeMerkur(): void {
  const globalContext = getGlobalContext();

  delete globalContext.__merkur__;
}

export function getMerkur(): Merkur {
  const globalContext = getGlobalContext();

  if (!globalContext.__merkur__) {
    globalContext.__merkur__ = {
      $in: {
        widgets: [],
        widgetFactory: {},
      },
      $external: {},
      $dependencies: {},
      $plugins: [],
      register,
      create,
    };
  }

  return globalContext.__merkur__ as Merkur;
}

function getGlobalContext(): Partial<GlobalContext> {
  if (typeof globalThis !== 'undefined') {
    return globalThis as Partial<GlobalContext>;
  }
  if (typeof self !== 'undefined') {
    return self as Partial<GlobalContext>;
  }
  if (typeof window !== 'undefined') {
    return window as Partial<GlobalContext>;
  }
  if (typeof global !== 'undefined') {
    return global as Partial<GlobalContext>;
  }

  return {};
}
