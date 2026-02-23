import { HttpClient } from '../client.js';
import type { ApiResponse } from '../errors/index.js';
import { failure, success } from '../errors/index.js';
import { ErrorCode } from '../errors/codes.js';
import type { DisputeRisk, GetDisputeRiskParams } from '../types/index.js';

export class DisputesResource {
  constructor(private readonly client: HttpClient) {}

  async getRisk(params: GetDisputeRiskParams): Promise<ApiResponse<DisputeRisk>> {
    if (!params.transactionId) {
      return failure('Transaction ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const risk = await this.client.get<DisputeRisk>(
        `/v1/disputes/risk?transaction_id=${encodeURIComponent(params.transactionId)}`,
      );
      return success(risk);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to get dispute risk',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async flag(transactionId: string, reason: string): Promise<ApiResponse<{ flagged: boolean }>> {
    if (!transactionId) {
      return failure('Transaction ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const result = await this.client.post<{ flagged: boolean }>('/v1/disputes/flag', {
        transactionId,
        reason,
      });
      return success(result);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to flag transaction',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }
}
