import { HttpClient } from '../client.js';
import type { ApiResponse } from '../errors/index.js';
import { failure, success } from '../errors/index.js';
import { ErrorCode } from '../errors/codes.js';
import type { Refund, CreateRefundParams, ListRefundsParams } from '../types/refund.js';
import { createRefundSchema, listRefundsSchema } from '../utils/validation.js';

export class RefundsResource {
  constructor(private readonly client: HttpClient) {}

  async create(params: CreateRefundParams): Promise<ApiResponse<Refund>> {
    const parsed = createRefundSchema.safeParse(params);
    if (!parsed.success) {
      return failure(parsed.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
    }

    try {
      const refund = await this.client.post<Refund>('/v1/refunds', parsed.data);
      return success(refund);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to create refund',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async get(refundId: string): Promise<ApiResponse<Refund>> {
    if (!refundId) {
      return failure('Refund ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const refund = await this.client.get<Refund>(`/v1/refunds/${encodeURIComponent(refundId)}`);
      return success(refund);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to get refund',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async list(params: ListRefundsParams = {}): Promise<ApiResponse<Refund[]>> {
    const parsed = listRefundsSchema.safeParse(params);
    if (!parsed.success) {
      return failure(parsed.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
    }

    const searchParams = new URLSearchParams();
    const { status, processor, limit, offset } = parsed.data;
    if (status) searchParams.set('status', status);
    if (processor) searchParams.set('processor', processor);
    searchParams.set('limit', String(limit));
    searchParams.set('offset', String(offset));

    try {
      const refunds = await this.client.get<Refund[]>(`/v1/refunds?${searchParams.toString()}`);
      return success(refunds);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to list refunds',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async cancel(refundId: string): Promise<ApiResponse<Refund>> {
    if (!refundId) {
      return failure('Refund ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const refund = await this.client.post<Refund>(
        `/v1/refunds/${encodeURIComponent(refundId)}/cancel`,
        {},
      );
      return success(refund);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to cancel refund',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }
}
