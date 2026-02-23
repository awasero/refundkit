import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // TODO: authenticate, check refund is cancellable, cancel via processor
    const refund = {
      id,
      status: 'cancelled',
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
