// Production-safe logging utility
// Replaces console.log with environment-aware logging

const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

class Logger {
  static log(message, ...args) {
    if (isDevelopment) {
      console.log(message, ...args);
    }
    // In production, could send to logging service
  }

  static error(message, ...args) {
    // Always log errors
    console.error(message, ...args);
    // In production, send to error tracking service
  }

  static warn(message, ...args) {
    if (isDevelopment || isProduction) {
      console.warn(message, ...args);
    }
  }

  static info(message, ...args) {
    if (isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  static success(message, ...args) {
    if (isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  static debug(message, ...args) {
    if (isDevelopment) {
      console.log(`🔍 ${message}`, ...args);
    }
  }
}

module.exports = Logger;

