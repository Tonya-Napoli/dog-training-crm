// src/api/utils/errors.js
export class EmailServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmailServiceError';
    this.code = 'EMAIL_SERVICE_ERROR';
  }
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
  }
}

export class InviteError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InviteError';
    this.code = 'INVITE_ERROR';
  }
}

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.code = 'AUTH_ERROR';
  }
}