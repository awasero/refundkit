import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const revokeSchema = z.object({
  token: z.string().min(1),
  token_type_hint: z.enum(['access_token', 'refresh_token']).optional(),
});

/**
 * OAuth 2.0 Token Revocation endpoint (RFC 7009).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = revokeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // TODO: Look up and revoke the token
    // TODO: If access_token, also revoke associated refresh token
    // TODO: If refresh_token, also revoke associated access tokens

    // RFC 7009 says return 200 even if token doesn't exist
    return new NextResponse(null, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 },
    );
  }
}
