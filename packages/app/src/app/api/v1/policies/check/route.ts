import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: look up actual policy from database
    const policy = {
      eligible: true,
      reason: 'Transaction is within the refund window',
      maxAmount: null,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      conditions: ['Original payment must be settled', 'Items must not have been used'],
    };

    return NextResponse.json({ data: policy, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
