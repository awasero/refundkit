import { ErrorCode } from './codes.js';

export { ErrorCode } from './codes.js';

export class RefundKitError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number | null;

  constructor(message: string, code: ErrorCode, statusCode: number | null = null) {
    super(message);
    this.name = 'RefundKitError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface ApiResponse<T> {
  data: T | null;
  error: RefundKitError | null;
}

export function success<T>(data: T): ApiResponse<T> {
  return { data, error: null };
}

export function failure<T = never>(
  message: string,
  code: ErrorCode,
  statusCode: number | null = null,
): ApiResponse<T> {
  return { data: null, error: new RefundKitError(message, code, statusCode) };
}
