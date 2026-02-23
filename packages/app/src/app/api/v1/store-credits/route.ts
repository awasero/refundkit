import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const issueStoreCreditSchema = z.object({
  customerId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).default('usd'),
  creditType: z.enum(['refund_conversion', 'goodwill', 'exchange_difference', 'promotional']),
  refundId: z.string().optional(),
  returnId: z.string().optional(),
  expiresInDays: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: authenticate via api-auth.ts
    const body = await request.json();
    const parsed = issueStoreCreditSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: create store credit in database
    const credit = {
      id: `sc_${crypto.randomUUID().slice(0, 8)}`,
      organizationId: 'org_placeholder',
      customerId: parsed.data.customerId,
      refundId: parsed.data.refundId ?? null,
      returnId: parsed.data.returnId ?? null,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      creditType: parsed.data.creditType,
      status: 'active',
      redeemedAmount: 0,
      remainingAmount: parsed.data.amount,
      expiresAt: parsed.data.expiresInDays
        ? new Date(Date.now() + parsed.data.expiresInDays * 86400000).toISOString()
        : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: credit, error: null }, { status: 201 });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
