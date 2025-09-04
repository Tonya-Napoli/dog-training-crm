// src/utils/Logger.js
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

export class Logger {
  constructor(service) {
    this.validateService(service);
    this.service = service;
  }

  info(message, data = null) {
    this.log(LogLevel.INFO, message, data);
  }

  error(message, error = null) {
    this.log(LogLevel.ERROR, message, error);
  }

  warn(message, data = null) {
    this.log(LogLevel.WARN, message, data);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  log(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    const logMessage = `[${timestamp}] [${this.service}] ${level}: ${message}${dataStr}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  validateService(service) {
    if (!service || typeof service !== 'string' || service.trim().length === 0) {
      throw new Error('Logger service name is required and must be a non-empty string');
    }
  }
}