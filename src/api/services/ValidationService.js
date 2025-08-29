// src/api/services/ValidationService.js
import { ValidationError } from '../utils/errors.js';

export class ValidationService {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new ValidationError('Valid email address is required');
    }
  }

  validateName(name) {
    if (!name || name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long');
    }
  }

  validatePassword(password) {
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
  }

  validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      throw new ValidationError(`${fieldName} is required`);
    }
  }
}