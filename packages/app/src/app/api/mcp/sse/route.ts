import { NextRequest } from 'next/server';

/**
 * Server-Sent Events endpoint for the remote MCP server.
 * Clients connect via SSE and send tool calls as events.
 *
 * Authentication: Bearer token (OAuth access token or API key)
 *
 * Usage:
 *   curl -N -H "Authorization: Bearer <token>" https://mcp.refundkit.dev/api/mcp/sse
 */
export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return new Response(
      JSON.stringify({ error: { message: 'Authorization required', code: 'unauthorized' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // TODO: Validate the token (OAuth access token or API key)
  // TODO: Resolve organization ID from the token
  // TODO: Determine tool scope from the token's granted scopes

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'connection',
            status: 'connected',
            serverInfo: { name: 'refundkit', version: '0.2.0' },
            capabilities: { tools: {} },
          })}\n\n`,
        ),
      );

      // Send available tools list
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'tools/list',
            tools: [
              'refundkit_process_refund',
              'refundkit_check_refund_status',
              'refundkit_list_refunds',
              'refundkit_check_eligibility',
              'refundkit_get_policy',
              'refundkit_create_return',
              'refundkit_track_return',
              'refundkit_list_returns',
              'refundkit_get_dispute_risk',
              'refundkit_cancel_refund',
              'refundkit_issue_store_credit',
              'refundkit_approve_refund',
            ],
          })}\n\n`,
        ),
      );

      // Keep connection alive with periodic heartbeats
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
