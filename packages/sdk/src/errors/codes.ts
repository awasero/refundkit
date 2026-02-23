export const ErrorCode = {
  INVALID_API_KEY: 'invalid_api_key',
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
  REFUND_ALREADY_PROCESSED: 'refund_already_processed',
  REFUND_NOT_CANCELLABLE: 'refund_not_cancellable',
  PROCESSOR_ERROR: 'processor_error',
  RATE_LIMITED: 'rate_limited',
  INTERNAL_ERROR: 'internal_error',
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
