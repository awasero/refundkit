import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const decisionSchema = z.object({
  decision: z.enum(['approve', 'reject', 'escalate']),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // TODO: authenticate via api-auth.ts
    const body = await request.json();
    const parsed = decisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    if (!id) {
      return NextResponse.json(
        { data: null, error: { message: 'Approval ID is required', code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: lookup approval, update status, record decision
    return NextResponse.json({
      data: null,
      error: { message: 'Approval not found', code: 'not_found' },
    }, { status: 404 });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
