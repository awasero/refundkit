import { RefundKitError, ErrorCode } from './errors/index.js';
import { DEFAULT_BASE_URL, DEFAULT_TIMEOUT } from './types/config.js';

interface ClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

export class HttpClient {
  private readonly config: ClientConfig;

  constructor(config: Partial<ClientConfig> & { apiKey: string }) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': '@refundkit/sdk',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const json = (await response.json()) as { data?: T; error?: { message: string; code: string } };

      if (!response.ok) {
        throw new RefundKitError(
          json.error?.message ?? `Request failed with status ${response.status}`,
          (json.error?.code as ErrorCode) ?? ErrorCode.INTERNAL_ERROR,
          response.status,
        );
      }

      return json.data as T;
    } catch (err) {
      if (err instanceof RefundKitError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new RefundKitError('Request timed out', ErrorCode.TIMEOUT);
      }
      throw new RefundKitError(
        err instanceof Error ? err.message : 'Network error',
        ErrorCode.NETWORK_ERROR,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }
}
