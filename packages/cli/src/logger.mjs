import chalk from 'chalk';

export class Logger {
  #identifier = null;
  #cliConfig = null;

  constructor(identifier, cliConfig) {
    this.#identifier = identifier;
    this.#cliConfig = cliConfig;
  }

  #log(prefix, color, message) {
    if (prefix) {
      process.stdout.write(
        color(`${prefix}: ${this.#identifier ? `(${this.#identifier}) ` : ''}`),
      );
    }

    try {
      message = message ?? typeof message;
      process.stdout.write(message);
    } catch (error) {
      console.error(error);
    }

    process.stdout.write('\n');
  }

  info(message, options) {
    // if (!this.#cliConfig?.verbose) {
    //   return;
    // }

    this.#log('info', chalk.bold.cyan, message, options);
  }

  log(message, options) {
    this.#log(null, chalk.bold.cyan, message, options);
  }

  debug(message, options) {
    if (!this.#cliConfig?.verbose) {
      return;
    }

    this.#log('debug', chalk.bold.cyan, message, options);
  }

  warn(message, options) {
    this.#log('warn', chalk.bold.yellow, message, options);
  }

  error(message, options) {
    if (message instanceof Error) {
      const [_, ...stackLines] = message.stack?.split('\n') ?? ''; //eslint-disable-line

      this.#log(
        'error',
        chalk.bold.red,
        `${chalk.underline(message.name)}: ${message.message.trim()}`,
        options,
      );

      process.stdout.write(`\n${chalk.gray(stackLines.join('\n'))}\n`);

      if (message?.cause instanceof Error) {
        this.error(message.cause, options);
      }
    } else {
      this.#log('error', chalk.bold.red, message, options);
    }
  }
}

export function createLogger(name, cliConfig = {}) {
  return new Logger(name, cliConfig);
}
