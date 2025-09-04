import { HTTP_STATUS } from '../constants/httpStatus.js';
import { 
  EmailServiceError, 
  ValidationError, 
  NotFoundError, 
  DatabaseError,
  InviteError 
} from '../utils/errors.js';

export class InviteErrorHandler {
  constructor(logger) {
    this.logger = logger;
  }

  handleError(error, res) {
    this.logger.error(`Invite error: ${error.message}`, { stack: error.stack });
    
    const errorResponse = this.buildErrorResponse(error);
    return res.status(errorResponse.statusCode).json(errorResponse.body);
  }

  buildErrorResponse(error) {
    const errorMap = {
      [ValidationError.name]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message
      },
      [NotFoundError.name]: {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: error.message
      },
      [InviteError.name]: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message
      },
      [EmailServiceError.name]: {
        statusCode: HTTP_STATUS.BAD_GATEWAY,
        message: 'Failed to send invite email'
      },
      [DatabaseError.name]: {
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed'
      }
    };

    const errorConfig = errorMap[error.constructor.name] || {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Internal server error'
    };

    return {
      statusCode: errorConfig.statusCode,
      body: {
        success: false,
        message: errorConfig.message,
        code: error.code || 'INTERNAL_ERROR'
      }
    };
  }
}