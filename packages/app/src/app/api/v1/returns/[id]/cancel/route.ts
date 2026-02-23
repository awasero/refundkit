import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // TODO: authenticate via api-auth.ts
    // TODO: lookup return, verify status is cancellable (requested or approved)
    // TODO: update return status to 'rejected' in database

    if (!id) {
      return NextResponse.json(
        { data: null, error: { message: 'Return ID is required', code: 'validation_error' } },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: null,
      error: { message: 'Return not found', code: 'not_found' },
    }, { status: 404 });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
