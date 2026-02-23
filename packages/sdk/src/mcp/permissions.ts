export type ToolScope = 'read' | 'write' | 'admin';

export const TOOL_SCOPES: Record<string, ToolScope> = {
  // Read-only tools
  refundkit_check_refund_status: 'read',
  refundkit_list_refunds: 'read',
  refundkit_check_eligibility: 'read',
  refundkit_get_policy: 'read',
  refundkit_track_return: 'read',
  refundkit_get_dispute_risk: 'read',
  refundkit_list_returns: 'read',

  // Read-write tools
  refundkit_process_refund: 'write',
  refundkit_create_return: 'write',
  refundkit_cancel_refund: 'write',
  refundkit_issue_store_credit: 'write',

  // Admin tools
  refundkit_approve_refund: 'admin',
};

const SCOPE_HIERARCHY: Record<ToolScope, ToolScope[]> = {
  read: ['read'],
  write: ['read', 'write'],
  admin: ['read', 'write', 'admin'],
};

/**
 * Check if a given scope grants access to a tool.
 */
export function hasToolAccess(toolName: string, grantedScope: ToolScope): boolean {
  const requiredScope = TOOL_SCOPES[toolName];
  if (!requiredScope) return false;
  return SCOPE_HIERARCHY[grantedScope].includes(requiredScope);
}

/**
 * Filter tools by scope — returns only tools the scope has access to.
 */
export function filterToolsByScope<T extends { name: string }>(
  tools: T[],
  scope: ToolScope,
): T[] {
  return tools.filter((tool) => hasToolAccess(tool.name, scope));
}
