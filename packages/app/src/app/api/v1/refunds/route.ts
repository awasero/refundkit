import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createRefundSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).default('usd'),
  reason: z.enum([
    'product_not_received',
    'product_defective',
    'wrong_product',
    'duplicate_charge',
    'subscription_cancelled',
    'other',
  ]),
  processor: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const listSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  processor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: authenticate via api-auth.ts
    const body = await request.json();
    const parsed = createRefundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: create refund in database via Supabase
    const refund = {
      id: `ref_${crypto.randomUUID().slice(0, 8)}`,
      organizationId: 'org_placeholder',
      externalRefundId: null,
      transactionId: parsed.data.transactionId,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      reason: parsed.data.reason,
      status: 'pending',
      processor: parsed.data.processor ?? 'stripe',
      metadata: parsed.data.metadata ?? null,
      initiatedBy: 'api',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: refund, error: null }, { status: 201 });
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

    // TODO: query refunds from database
    const refunds: unknown[] = [];

    return NextResponse.json({ data: refunds, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
