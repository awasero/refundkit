import { HttpClient } from '../client.js';
import type { ApiResponse } from '../errors/index.js';
import { failure, success } from '../errors/index.js';
import { ErrorCode } from '../errors/codes.js';
import type { StoreCredit, IssueStoreCreditParams } from '../types/index.js';

export class StoreCreditResource {
  constructor(private readonly client: HttpClient) {}

  async issue(params: IssueStoreCreditParams): Promise<ApiResponse<StoreCredit>> {
    if (!params.customerId) {
      return failure('Customer ID is required', ErrorCode.VALIDATION_ERROR);
    }
    if (!params.amount || params.amount <= 0) {
      return failure('Amount must be positive', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const credit = await this.client.post<StoreCredit>('/v1/store-credit', params);
      return success(credit);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to issue store credit',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async get(id: string): Promise<ApiResponse<StoreCredit>> {
    if (!id) {
      return failure('Store credit ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const credit = await this.client.get<StoreCredit>(
        `/v1/store-credit/${encodeURIComponent(id)}`,
      );
      return success(credit);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to get store credit',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async listByCustomer(customerId: string): Promise<ApiResponse<StoreCredit[]>> {
    if (!customerId) {
      return failure('Customer ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const credits = await this.client.get<StoreCredit[]>(
        `/v1/store-credit?customer_id=${encodeURIComponent(customerId)}`,
      );
      return success(credits);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to list store credits',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }
}
