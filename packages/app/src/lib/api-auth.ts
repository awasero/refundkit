import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export type AuthResult =
  | { data: ApiKeyAuth; error: null }
  | { data: SessionAuth; error: null }
  | { data: null; error: AuthError };

export interface ApiKeyAuth {
  kind: 'api_key';
  organizationId: string;
  environment: 'live' | 'test';
}

export interface SessionAuth {
  kind: 'session';
  organizationId: string;
  userId: string;
}

export interface AuthError {
  code: 'UNAUTHORIZED' | 'INVALID_API_KEY' | 'NO_ORGANIZATION';
  message: string;
}

/**
 * Hash a raw API key with SHA-256 to compare against stored hashes.
 */
async function hashApiKey(rawKey: string): Promise<string> {
  const encoded = new TextEncoder().encode(rawKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Authenticate an incoming request using either an API key or a session cookie.
 *
 * Resolution order:
 *   1. If an `Authorization: Bearer rk_...` header is present, authenticate via API key.
 *   2. Otherwise, fall back to the Supabase session cookie.
 */
export async function authenticateRequest(): Promise<AuthResult> {
  const headerStore = await headers();
  const authorization = headerStore.get('authorization');

  // --- API key authentication ---
  if (authorization) {
    const token = authorization.replace(/^Bearer\s+/i, '');

    if (!token.startsWith('rk_')) {
      return {
        data: null,
        error: {
          code: 'INVALID_API_KEY',
          message: 'API key must start with the "rk_" prefix.',
        },
      };
    }

    const keyHash = await hashApiKey(token);

    // TODO: Replace with actual Supabase query once the database is connected.
    // The query would look something like:
    //
    //   const { data: apiKey, error } = await supabase
    //     .from('api_keys')
    //     .select('organization_id, environment')
    //     .eq('key_hash', keyHash)
    //     .is('revoked_at', null)
    //     .single();
    //
    //   if (error || !apiKey) {
    //     return { data: null, error: { code: 'INVALID_API_KEY', message: '...' } };
    //   }
    //
    //   return {
    //     data: {
    //       kind: 'api_key',
    //       organizationId: apiKey.organization_id,
    //       environment: apiKey.environment,
    //     },
    //     error: null,
    //   };

    void keyHash; // suppress unused-variable warning until DB is connected

    return {
      data: null,
      error: {
        code: 'INVALID_API_KEY',
        message: 'API key lookup is not yet connected to the database.',
      },
    };
  }

  // --- Session cookie authentication ---
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No valid session. Please log in or provide an API key.',
      },
    };
  }

  // TODO: Replace with actual Supabase query once the database is connected.
  // The query would look something like:
  //
  //   const { data: membership, error } = await supabase
  //     .from('users_organizations')
  //     .select('organization_id')
  //     .eq('user_id', user.id)
  //     .single();
  //
  //   if (error || !membership) {
  //     return { data: null, error: { code: 'NO_ORGANIZATION', message: '...' } };
  //   }
  //
  //   return {
  //     data: {
  //       kind: 'session',
  //       organizationId: membership.organization_id,
  //       userId: user.id,
  //     },
  //     error: null,
  //   };

  void user; // suppress unused-variable warning until DB is connected

  return {
    data: null,
    error: {
      code: 'NO_ORGANIZATION',
      message: 'Organization lookup is not yet connected to the database.',
    },
  };
}
