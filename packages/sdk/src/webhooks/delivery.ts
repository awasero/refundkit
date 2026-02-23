export interface DeliveryResult {
  success: boolean;
  statusCode: number | null;
  attempt: number;
  error?: string;
}

export interface DeliveryConfig {
  maxRetries: number;
  timeoutMs: number;
  retryDelays: number[];  // in ms
}

export const DEFAULT_DELIVERY_CONFIG: DeliveryConfig = {
  maxRetries: 5,
  timeoutMs: 10_000,
  retryDelays: [5_000, 30_000, 300_000, 1_800_000, 7_200_000], // 5s, 30s, 5m, 30m, 2h
};

/**
 * Determine if a response status code is retryable.
 */
export function isRetryable(statusCode: number): boolean {
  if (statusCode === 429) return true;    // Rate limited
  if (statusCode >= 500) return true;      // Server error
  return false;
}

/**
 * Deliver a webhook payload to an endpoint with retry logic.
 */
export async function deliverWebhook(
  url: string,
  payload: string,
  signature: string,
  config: DeliveryConfig = DEFAULT_DELIVERY_CONFIG,
): Promise<DeliveryResult> {
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RefundKit-Signature': signature,
          'User-Agent': 'RefundKit-Webhook/1.0',
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        return { success: true, statusCode: response.status, attempt };
      }

      if (!isRetryable(response.status)) {
        return {
          success: false,
          statusCode: response.status,
          attempt,
          error: `Non-retryable status: ${response.status}`,
        };
      }

      // Wait before retrying (if we have retries left)
      if (attempt <= config.maxRetries) {
        const delay = config.retryDelays[attempt - 1] ?? config.retryDelays[config.retryDelays.length - 1];
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (err) {
      if (attempt > config.maxRetries) {
        return {
          success: false,
          statusCode: null,
          attempt,
          error: err instanceof Error ? err.message : 'Unknown delivery error',
        };
      }

      const delay = config.retryDelays[attempt - 1] ?? config.retryDelays[config.retryDelays.length - 1];
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    statusCode: null,
    attempt: config.maxRetries + 1,
    error: 'Max retries exceeded',
  };
}
