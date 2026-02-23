import { HttpClient } from '../client.js';
import type { ApiResponse } from '../errors/index.js';
import { failure, success } from '../errors/index.js';
import { ErrorCode } from '../errors/codes.js';
import type { Return, CreateReturnParams, ListReturnsParams, ReturnShipment } from '../types/index.js';

export class ReturnsResource {
  constructor(private readonly client: HttpClient) {}

  async create(params: CreateReturnParams): Promise<ApiResponse<Return>> {
    if (!params.refundId) {
      return failure('Refund ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const result = await this.client.post<Return>('/v1/returns', params);
      return success(result);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to create return',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async get(id: string): Promise<ApiResponse<Return>> {
    if (!id) {
      return failure('Return ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const result = await this.client.get<Return>(`/v1/returns/${encodeURIComponent(id)}`);
      return success(result);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to get return',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async list(params: ListReturnsParams = {}): Promise<ApiResponse<Return[]>> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();

    try {
      const results = await this.client.get<Return[]>(`/v1/returns${query ? `?${query}` : ''}`);
      return success(results);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to list returns',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async trackShipment(id: string): Promise<ApiResponse<ReturnShipment>> {
    if (!id) {
      return failure('Return ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const shipment = await this.client.get<ReturnShipment>(
        `/v1/returns/${encodeURIComponent(id)}/shipment`,
      );
      return success(shipment);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to track shipment',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async cancel(id: string): Promise<ApiResponse<Return>> {
    if (!id) {
      return failure('Return ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const result = await this.client.post<Return>(
        `/v1/returns/${encodeURIComponent(id)}/cancel`,
        {},
      );
      return success(result);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to cancel return',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }
}
