import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const configureWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(16),
  active: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: authenticate via api-auth.ts
    const body = await request.json();
    const parsed = configureWebhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { message: parsed.error.issues[0].message, code: 'validation_error' } },
        { status: 400 },
      );
    }

    // TODO: upsert webhook endpoint in database
    const endpoint = {
      id: `wh_${crypto.randomUUID().slice(0, 8)}`,
      organizationId: 'org_placeholder',
      url: parsed.data.url,
      events: parsed.data.events,
      secret: parsed.data.secret,
      active: parsed.data.active,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: endpoint, error: null }, { status: 201 });
  } catch {
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'internal_error' } },
      { status: 500 },
    );
  }
}
