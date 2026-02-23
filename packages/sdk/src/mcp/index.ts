import { createMcpServer, startMcpServer } from './server.js';

export { createMcpServer, startMcpServer };

// Auto-start when run as CLI
startMcpServer().catch((err: unknown) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});
