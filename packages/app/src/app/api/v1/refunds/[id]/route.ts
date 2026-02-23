import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // TODO: authenticate and fetch from Supabase
    const refund = {
      id,
      organizationId: 'org_placeholder',
      externalRefundId: null,
      transactionId: 'txn_placeholder',
      amount: 2999,
      currency: 'usd',
      reason: 'product_not_received',
      status: 'pending',
      processor: 'stripe',
      metadata: null,
      initiatedBy: 'api',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: refund, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
