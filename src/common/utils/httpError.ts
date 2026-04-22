import { HttpStatus } from '../constants/enums';

export class HttpError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, options?: { code?: string; details?: unknown }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(HttpStatus.BAD_REQUEST, message, { code: 'BAD_REQUEST', details });
  }

  static unauthorized(message = 'Unauthorized') {
    return new HttpError(HttpStatus.UNAUTHORIZED, message, { code: 'UNAUTHORIZED' });
  }

  static notFound(resource: string) {
    return new HttpError(HttpStatus.NOT_FOUND, `${resource} not found`, { code: 'NOT_FOUND' });
  }

  static conflict(message: string) {
    return new HttpError(HttpStatus.CONFLICT, message, { code: 'CONFLICT' });
  }
}
