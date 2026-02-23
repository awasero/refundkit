import { HttpClient } from '../client.js';
import type { ApiResponse } from '../errors/index.js';
import { failure, success } from '../errors/index.js';
import { ErrorCode } from '../errors/codes.js';
import type { RefundPolicy, CheckPolicyParams } from '../types/policy.js';
import { checkPolicySchema } from '../utils/validation.js';

export class PoliciesResource {
  constructor(private readonly client: HttpClient) {}

  async check(params: CheckPolicyParams): Promise<ApiResponse<RefundPolicy>> {
    const parsed = checkPolicySchema.safeParse(params);
    if (!parsed.success) {
      return failure(parsed.error.issues[0].message, ErrorCode.VALIDATION_ERROR);
    }

    try {
      const policy = await this.client.post<RefundPolicy>('/v1/policies/check', parsed.data);
      return success(policy);
    } catch (err) {
      return failure(
        err instanceof Error ? err.message : 'Failed to check policy',
        ErrorCode.INTERNAL_ERROR,
      );
    }
  }
}
