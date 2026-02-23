import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // TODO: implement MCP SSE endpoint
  // This will serve as the server-sent events endpoint for the MCP server
  // when running in HTTP/SSE mode (as opposed to stdio mode)

  return NextResponse.json(
    {
      data: null,
      error: {
        message: 'MCP SSE endpoint not yet implemented. Use the stdio transport via @refundkit/sdk/mcp.',
        code: 'not_implemented',
      },
    },
    { status: 501 },
  );
}
