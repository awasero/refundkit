import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const tokenSchema = z.discriminatedUnion('grant_type', [
  z.object({
    grant_type: z.literal('authorization_code'),
    code: z.string().min(1),
    client_id: z.string().min(1),
    client_secret: z.string().min(1),
    redirect_uri: z.string().url(),
  }),
  z.object({
    grant_type: z.literal('refresh_token'),
    refresh_token: z.string().min(1),
    client_id: z.string().min(1),
    client_secret: z.string().min(1),
  }),
]);

/**
 * OAuth 2.0 Token endpoint.
 * Exchanges authorization codes for access tokens, or refreshes tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = tokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // TODO: Validate client credentials
    // TODO: For authorization_code: validate code, generate tokens
    // TODO: For refresh_token: validate refresh token, generate new tokens

    // Placeholder token response
    return NextResponse.json({
      access_token: 'rk_access_placeholder',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'rk_refresh_placeholder',
      scope: 'read write',
    });
  } catch {
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 },
    );
  }
}
