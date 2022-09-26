class Logger {
  constructor() {
    this.initialized = false;
  }

  init(debug) {
    this.consoleDebug = debug('app:debug');
    this.consoleDebug.log = console.log.bind(console);
    this.consoleInfo = debug('app:info');
    this.consoleInfo.log = console.info.bind(console);
    this.consoleError = debug('app:error');
    this.consoleError.color = debug.colors[5];

    this.initialized = true;
  }

  debug(...args) {
    if (!this.initialized) {
      return;
    }

    this.consoleDebug(...args);
  }

  info(...args) {
    if (!this.initialized) {
      return;
    }

    this.consoleInfo(...args);
  }

  error(...args) {
    if (!this.initialized) {
      return;
    }

    this.consoleError(...args);
  }
}

export default new Logger();
