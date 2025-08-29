export class EmailServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class InviteError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InviteError';
  }
}