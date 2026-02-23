import type { WebhookEventType, WebhookConfig, WebhookEvent } from '../types/webhook.js';
import { createSignedPayload } from './signature.js';
import { deliverWebhook, DEFAULT_DELIVERY_CONFIG } from './delivery.js';
import type { DeliveryConfig, DeliveryResult } from './delivery.js';

export interface WebhookEndpoint extends WebhookConfig {
  id: string;
  organizationId: string;
  failureCount: number;
  lastDeliveredAt: string | null;
}

export interface EmitResult {
  eventId: string;
  deliveries: Array<{
    endpointId: string;
    url: string;
    result: DeliveryResult;
  }>;
}

export class WebhookEmitter {
  private endpoints: WebhookEndpoint[] = [];
  private deliveryConfig: DeliveryConfig;
  private onDelivery?: (endpointId: string, eventType: WebhookEventType, result: DeliveryResult) => void;

  constructor(config?: {
    deliveryConfig?: DeliveryConfig;
    onDelivery?: (endpointId: string, eventType: WebhookEventType, result: DeliveryResult) => void;
  }) {
    this.deliveryConfig = config?.deliveryConfig ?? DEFAULT_DELIVERY_CONFIG;
    this.onDelivery = config?.onDelivery;
  }

  registerEndpoint(endpoint: WebhookEndpoint): void {
    this.endpoints.push(endpoint);
  }

  removeEndpoint(endpointId: string): void {
    this.endpoints = this.endpoints.filter((e) => e.id !== endpointId);
  }

  listEndpoints(organizationId: string): WebhookEndpoint[] {
    return this.endpoints.filter((e) => e.organizationId === organizationId);
  }

  async emit<T = Record<string, unknown>>(
    eventType: WebhookEventType,
    data: T,
    organizationId: string,
  ): Promise<EmitResult> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const event: WebhookEvent<T> = {
      id: eventId,
      type: eventType,
      created: new Date().toISOString(),
      data,
    };

    // Find matching endpoints for this organization and event type
    const matchingEndpoints = this.endpoints.filter(
      (ep) =>
        ep.organizationId === organizationId &&
        ep.active &&
        ep.events.includes(eventType),
    );

    const deliveries: EmitResult['deliveries'] = [];

    // Fan out to all matching endpoints
    const promises = matchingEndpoints.map(async (endpoint) => {
      const { payload, signature } = createSignedPayload(
        event as unknown as Record<string, unknown>,
        endpoint.secret,
      );

      const result = await deliverWebhook(
        endpoint.url,
        payload,
        signature,
        this.deliveryConfig,
      );

      this.onDelivery?.(endpoint.id, eventType, result);

      deliveries.push({
        endpointId: endpoint.id,
        url: endpoint.url,
        result,
      });
    });

    await Promise.allSettled(promises);

    return { eventId, deliveries };
  }
}
