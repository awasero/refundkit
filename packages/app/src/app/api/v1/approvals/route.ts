import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const listSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'escalated']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

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

    // TODO: query approvals from database
    const approvals: unknown[] = [];

    return NextResponse.json({ data: approvals, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
