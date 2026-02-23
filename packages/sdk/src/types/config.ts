export interface RefundKitConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export const DEFAULT_BASE_URL = 'https://api.refundkit.dev';
export const DEFAULT_TIMEOUT = 30_000;
