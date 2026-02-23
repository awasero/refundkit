import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkEligibilitySchema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().positive().optional(),
  items: z.array(z.object({
    sku: z.string(),
    category: z.string(),
    quantity: z.number().int().positive(),
    amount: z.number().optional(),
  })).optional(),
  customerId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: authenticate via api-auth.ts
    const body = await request.json();
    const parsed = checkEligibilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: Run PolicyEngine.evaluate() with organization's active policy
    const result = {
      eligible: true,
      policy: {
        returnWindowDays: 30,
        daysRemaining: 15,
        restockingFeePercent: 0,
        exchangeOnly: false,
        finalSale: false,
      },
      perItemEligibility: [],
      customerHistory: null,
      maxRefundAmount: parsed.data.amount ?? 0,
      restockingFee: 0,
      netRefundAmount: parsed.data.amount ?? 0,
      deadline: null,
      conditions: [],
      autoApproved: true,
    };

    return NextResponse.json({ data: result, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
