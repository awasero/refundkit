import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RefundKit } from '../index.js';
import { processRefundTool, handleProcessRefund } from './tools/process-refund.js';
import { checkStatusTool, handleCheckStatus } from './tools/check-status.js';
import { listRefundsTool, handleListRefunds } from './tools/list-refunds.js';
import { getPolicyTool, handleGetPolicy } from './tools/get-policy.js';
import { cancelRefundTool, handleCancelRefund } from './tools/cancel-refund.js';
import { checkEligibilityTool, handleCheckEligibility } from './tools/check-eligibility.js';
import { createReturnTool, handleCreateReturn } from './tools/create-return.js';
import { trackReturnTool, handleTrackReturn } from './tools/track-return.js';
import { getDisputeRiskTool, handleGetDisputeRisk } from './tools/get-dispute-risk.js';
import { approveRefundTool, handleApproveRefund } from './tools/approve-refund.js';
import { issueStoreCreditTool, handleIssueStoreCredit } from './tools/issue-store-credit.js';
import { listReturnsTool, handleListReturns } from './tools/list-returns.js';

const TOOLS = [
  processRefundTool,
  checkStatusTool,
  listRefundsTool,
  getPolicyTool,
  cancelRefundTool,
  checkEligibilityTool,
  createReturnTool,
  trackReturnTool,
  getDisputeRiskTool,
  approveRefundTool,
  issueStoreCreditTool,
  listReturnsTool,
];

type ToolHandler = (rk: RefundKit, args: Record<string, unknown>) => Promise<{
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}>;

const HANDLERS: Record<string, ToolHandler> = {
  [processRefundTool.name]: handleProcessRefund,
  [checkStatusTool.name]: handleCheckStatus,
  [listRefundsTool.name]: handleListRefunds,
  [getPolicyTool.name]: handleGetPolicy,
  [cancelRefundTool.name]: handleCancelRefund,
  [checkEligibilityTool.name]: handleCheckEligibility,
  [createReturnTool.name]: handleCreateReturn,
  [trackReturnTool.name]: handleTrackReturn,
  [getDisputeRiskTool.name]: handleGetDisputeRisk,
  [approveRefundTool.name]: handleApproveRefund,
  [issueStoreCreditTool.name]: handleIssueStoreCredit,
  [listReturnsTool.name]: handleListReturns,
};

export function createMcpServer(apiKey: string, baseUrl?: string): Server {
  const rk = new RefundKit({ apiKey, baseUrl });

  const server = new Server(
    { name: 'refundkit', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = HANDLERS[name];

    if (!handler) {
      return {
        content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }

    return handler(rk, (args ?? {}) as Record<string, unknown>);
  });

  return server;
}

export async function startMcpServer(): Promise<void> {
  const apiKey = process.env.REFUNDKIT_API_KEY;
  if (!apiKey) {
    console.error('REFUNDKIT_API_KEY environment variable is required');
    process.exit(1);
  }

  const server = createMcpServer(apiKey, process.env.REFUNDKIT_BASE_URL);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
