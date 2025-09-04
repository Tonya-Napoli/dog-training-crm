class ApplicationError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
  }
}

/**
 * Email Service Related Errors
 */
export class EmailServiceError extends ApplicationError {
  constructor(message) {
    super(message, 'EMAIL_SERVICE_ERROR', 502);
  }
}

/**
 * Validation Related Errors
 */
export class ValidationError extends ApplicationError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }
}

/**
 * Invitation Related Errors
 */
export class InviteError extends ApplicationError {
  constructor(message) {
    super(message, 'INVITE_ERROR', 400);
  }
}

/**
 * Authentication Related Errors
 */
export class AuthError extends ApplicationError {
  constructor(message) {
    super(message, 'AUTH_ERROR', 401);
  }
}

/**
 * Authorization Related Errors
 */
export class AuthorizationError extends ApplicationError {
  constructor(message) {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

/**
 * Resource Not Found Errors
 */
export class NotFoundError extends ApplicationError {
  constructor(resource) {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
    this.resource = resource;
  }
}

/**
 * Database Related Errors
 */
export class DatabaseError extends ApplicationError {
  constructor(message) {
    super(message, 'DATABASE_ERROR', 500);
  }
}