import { HttpClient } from '../client.js';
import type { ApiResponse } from '../errors/index.js';
import { failure, success } from '../errors/index.js';
import { ErrorCode } from '../errors/codes.js';
import type { ApprovalRequest, ListApprovalsParams } from '../types/index.js';

export class ApprovalsResource {
  constructor(private readonly client: HttpClient) {}

  async listPending(params: ListApprovalsParams = {}): Promise<ApiResponse<ApprovalRequest[]>> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();

    try {
      const approvals = await this.client.get<ApprovalRequest[]>(
        `/v1/approvals/pending${query ? `?${query}` : ''}`,
      );
      return success(approvals);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to list approvals',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async approve(id: string, reason?: string): Promise<ApiResponse<ApprovalRequest>> {
    if (!id) {
      return failure('Approval ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const approval = await this.client.post<ApprovalRequest>(
        `/v1/approvals/${encodeURIComponent(id)}/approve`,
        reason ? { reason } : {},
      );
      return success(approval);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to approve request',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async reject(id: string, reason: string): Promise<ApiResponse<ApprovalRequest>> {
    if (!id) {
      return failure('Approval ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const approval = await this.client.post<ApprovalRequest>(
        `/v1/approvals/${encodeURIComponent(id)}/reject`,
        { reason },
      );
      return success(approval);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to reject request',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  async escalate(id: string): Promise<ApiResponse<ApprovalRequest>> {
    if (!id) {
      return failure('Approval ID is required', ErrorCode.VALIDATION_ERROR);
    }

    try {
      const approval = await this.client.post<ApprovalRequest>(
        `/v1/approvals/${encodeURIComponent(id)}/escalate`,
        {},
      );
      return success(approval);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to escalate request',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }
}
