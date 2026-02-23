import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const disputeRiskSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().positive().optional(),
  customerId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: authenticate via api-auth.ts
    const body = await request.json();
    const parsed = disputeRiskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: Run DisputeRiskEngine.evaluate() with transaction data
    const result = {
      transactionId: parsed.data.transactionId,
      riskScore: 15,
      riskLevel: 'low',
      signals: [],
      recommendation: 'approve',
    };

    return NextResponse.json({ data: result, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
