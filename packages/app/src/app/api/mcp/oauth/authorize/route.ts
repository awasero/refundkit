import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const authorizeSchema = z.object({
  client_id: z.string().min(1),
  redirect_uri: z.string().url(),
  response_type: z.literal('code'),
  scope: z.string().default('read'),
  state: z.string().optional(),
});

/**
 * OAuth 2.0 Authorization endpoint.
 * Validates the request and redirects to the login page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = authorizeSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // TODO: Validate client_id against registered OAuth clients
  // TODO: Validate redirect_uri is registered for this client
  // TODO: Check if user is already authenticated
  // TODO: Show consent screen
  // TODO: Generate authorization code and redirect

  // For now, return a placeholder response
  return NextResponse.json({
    message: 'OAuth authorization endpoint',
    client_id: parsed.data.client_id,
    scope: parsed.data.scope,
    note: 'This endpoint will redirect to the login/consent flow when fully implemented.',
  });
}
