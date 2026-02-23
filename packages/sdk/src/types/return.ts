export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'label_generated'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'inspecting'
  | 'completed'
  | 'rejected';

export type ReturnMethod = 'mail' | 'drop_off' | 'keep_item';

export type ReturnItemReason =
  | 'wrong_size'
  | 'wrong_color'
  | 'defective'
  | 'not_as_described'
  | 'changed_mind'
  | 'arrived_late'
  | 'other';

export interface ReturnItem {
  sku: string;
  name?: string;
  quantity: number;
  reason: ReturnItemReason;
  condition?: 'new' | 'opened' | 'used' | 'damaged';
}

export interface ReturnShipment {
  carrier: string;
  trackingNumber: string;
  labelUrl: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
}

export interface Return {
  id: string;
  organizationId: string;
  refundId: string | null;
  rmaNumber: string;
  status: ReturnStatus;
  items: ReturnItem[];
  returnMethod: ReturnMethod;
  shipment: ReturnShipment | null;
  inspectionNotes: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnParams {
  refundId?: string;
  transactionId?: string;
  items: ReturnItem[];
  returnMethod: ReturnMethod;
  metadata?: Record<string, unknown>;
}

export interface ListReturnsParams {
  status?: ReturnStatus;
  limit?: number;
  offset?: number;
}
