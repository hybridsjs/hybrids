const Logdown = process.env.NODE_ENV !== 'production' ? require('logdown/src/index') : false;

const logger = Logdown ? new Logdown() : false;

function insertValues(msg, values) {
  return msg.replace(/%[a-z]+/gi, key => values[key.substr(1)]);
}

function clearWhitespace(msg) {
  return msg.replace(/ +/gi, ' ').replace(/(^\n+|\n+$)/, '');
}

export default class Debug {
  constructor(prefix) {
    this.prefix = prefix || '[@hybrids/debug]';
    this.messages = new Map();

    this.error = this.error.bind(this);
    this.warning = this.warning.bind(this);
  }

  docs(messages) {
    Object.keys(messages).forEach(key => this.messages.set(key, clearWhitespace(messages[key])));
  }

  resolve(error, text, values) {
    const msg = insertValues(text, values);

    if (typeof error === 'function') {
      error = new error(`\n${this.prefix} ${msg}`);
    } else {
      try {
        if (error.message[0] !== '\n') error.message = `\n${this.prefix} ${error.message}`;
        error.message = `${error.message}\n${this.prefix} ${msg}`;
      } catch (e) {
        throw error;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const info = this.messages.get(text);
      if (info) {
        Promise.resolve().then(() => logger.info(`*${this.prefix}*${insertValues(info, values)}`));
      }
    }

    return error;
  }

  warning(...args) {
    const e = this.resolve(...args);
    if (process.env.NODE_ENV !== 'production') {
      logger.error(e);
    } else {
      logger.warn(e);
    }
  }

  error(...args) {
    throw this.resolve(...args);
  }
}
