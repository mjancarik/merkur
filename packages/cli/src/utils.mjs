export function time() {
  const start = process.hrtime.bigint();

  return () => Number((process.hrtime.bigint() - start) / BigInt(1e6));
}

const PROTECTED_FIELDS = ['__proto__', 'prototype', 'constructor'];
export function deepMerge(target, source) {
  const isObject = (obj) => !!obj && obj.constructor === Object;

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    if (PROTECTED_FIELDS.includes(key)) {
      return;
    }

    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

export function addServerConfig(serverConfig, { protocol, hostname, port }) {
  if (protocol) {
    serverConfig.protocol = protocol;
  }
  if (port) {
    serverConfig.port = port;
  }

  const effectiveHostname =
    hostname ?? (port ? serverConfig.host?.split(':')[0] : null);

  if (effectiveHostname) {
    serverConfig.host = `${effectiveHostname}:${serverConfig.port}`;
  }

  if (serverConfig.protocol && serverConfig.host) {
    serverConfig.origin = new URL(
      `${serverConfig.protocol}//${serverConfig.host}`,
    ).origin;
  }

  return serverConfig;
}
