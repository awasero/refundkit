import type { ReturnStatus } from '../types/index.js';

const VALID_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ['approved', 'rejected'],
  approved: ['label_generated', 'shipped'],
  label_generated: ['shipped'],
  shipped: ['in_transit'],
  in_transit: ['delivered'],
  delivered: ['inspecting'],
  inspecting: ['completed', 'rejected'],
  completed: [],
  rejected: [],
};

export function canTransition(from: ReturnStatus, to: ReturnStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStates(status: ReturnStatus): ReturnStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

export function isTerminalState(status: ReturnStatus): boolean {
  return (VALID_TRANSITIONS[status]?.length ?? 0) === 0;
}
