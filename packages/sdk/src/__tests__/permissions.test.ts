import { describe, it, expect } from 'vitest';
import { hasToolAccess, filterToolsByScope, TOOL_SCOPES } from '../mcp/permissions.js';

describe('MCP Tool Permissions', () => {
  describe('hasToolAccess', () => {
    it('read scope can access read-only tools', () => {
      expect(hasToolAccess('refundkit_check_refund_status', 'read')).toBe(true);
      expect(hasToolAccess('refundkit_list_refunds', 'read')).toBe(true);
      expect(hasToolAccess('refundkit_check_eligibility', 'read')).toBe(true);
    });

    it('read scope cannot access write tools', () => {
      expect(hasToolAccess('refundkit_process_refund', 'read')).toBe(false);
      expect(hasToolAccess('refundkit_create_return', 'read')).toBe(false);
    });

    it('read scope cannot access admin tools', () => {
      expect(hasToolAccess('refundkit_approve_refund', 'read')).toBe(false);
    });

    it('write scope can access read and write tools', () => {
      expect(hasToolAccess('refundkit_list_refunds', 'write')).toBe(true);
      expect(hasToolAccess('refundkit_process_refund', 'write')).toBe(true);
      expect(hasToolAccess('refundkit_create_return', 'write')).toBe(true);
    });

    it('write scope cannot access admin tools', () => {
      expect(hasToolAccess('refundkit_approve_refund', 'write')).toBe(false);
    });

    it('admin scope can access all tools', () => {
      expect(hasToolAccess('refundkit_list_refunds', 'admin')).toBe(true);
      expect(hasToolAccess('refundkit_process_refund', 'admin')).toBe(true);
      expect(hasToolAccess('refundkit_approve_refund', 'admin')).toBe(true);
    });

    it('returns false for unknown tools', () => {
      expect(hasToolAccess('unknown_tool', 'admin')).toBe(false);
    });
  });

  describe('filterToolsByScope', () => {
    const allTools = Object.keys(TOOL_SCOPES).map(name => ({ name }));

    it('read scope filters to read-only tools', () => {
      const filtered = filterToolsByScope(allTools, 'read');
      expect(filtered.length).toBe(7);
      filtered.forEach(tool => {
        expect(TOOL_SCOPES[tool.name]).toBe('read');
      });
    });

    it('write scope includes read and write tools', () => {
      const filtered = filterToolsByScope(allTools, 'write');
      expect(filtered.length).toBe(11);
    });

    it('admin scope includes all tools', () => {
      const filtered = filterToolsByScope(allTools, 'admin');
      expect(filtered.length).toBe(allTools.length);
    });
  });
});
