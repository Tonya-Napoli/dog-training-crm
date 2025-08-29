// src/api/utils/Logger.js
export class Logger {
  constructor(service) {
    this.service = service;
  }

  info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.service}] INFO: ${message}`, data ? data : '');
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.service}] ERROR: ${message}`, error ? error : '');
  }

  warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${this.service}] WARN: ${message}`, data ? data : '');
  }

  debug(message, data = null) {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${timestamp}] [${this.service}] DEBUG: ${message}`, data ? data : '');
    }
  }
}