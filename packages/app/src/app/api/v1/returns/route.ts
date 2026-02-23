import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createReturnSchema = z.object({
  refundId: z.string().min(1),
  items: z.array(z.object({
    sku: z.string().min(1),
    quantity: z.number().int().positive(),
    reason: z.enum(['defective', 'wrong_item', 'not_as_described', 'no_longer_needed', 'sizing_issue', 'other']),
  })).min(1),
  method: z.enum(['mail', 'in_store', 'pickup']).default('mail'),
  customerEmail: z.string().email().optional(),
  customerNotes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const listSchema = z.object({
  status: z.enum(['requested', 'approved', 'label_generated', 'shipped', 'in_transit', 'delivered', 'inspecting', 'completed', 'rejected']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: authenticate via api-auth.ts
    const body = await request.json();
    const parsed = createReturnSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    const rmaNumber = `RMA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // TODO: create return in database via Supabase
    const returnObj = {
      id: `ret_${crypto.randomUUID().slice(0, 8)}`,
      organizationId: 'org_placeholder',
      refundId: parsed.data.refundId,
      rmaNumber,
      status: 'requested',
      method: parsed.data.method,
      items: parsed.data.items,
      shipment: null,
      customerEmail: parsed.data.customerEmail ?? null,
      customerNotes: parsed.data.customerNotes ?? null,
      metadata: parsed.data.metadata ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: returnObj, error: null }, { status: 201 });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: authenticate via api-auth.ts
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = listSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: query returns from database
    const returns: unknown[] = [];

    return NextResponse.json({ data: returns, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
