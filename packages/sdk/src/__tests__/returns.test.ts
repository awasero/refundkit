import { describe, it, expect } from 'vitest';
import { generateRmaNumber, isValidRmaFormat } from '../utils/rma.js';
import {
  canTransition,
  getNextStates,
  isTerminalState,
} from '../engine/return-state-machine.js';
import type { ReturnStatus } from '../types/index.js';

describe('RMA Number', () => {
  it('generates valid format', () => {
    const rma = generateRmaNumber();

    expect(rma).toMatch(/^RMA-\d{8}-[A-Z0-9]{6}$/);
  });

  it('includes todays date in YYYYMMDD format', () => {
    const rma = generateRmaNumber();
    const today = new Date();
    const expectedDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('');

    expect(rma).toContain(expectedDate);
  });

  it('generates unique numbers across 100 calls', () => {
    const rmas = new Set<string>();

    for (let i = 0; i < 100; i++) {
      rmas.add(generateRmaNumber());
    }

    expect(rmas.size).toBe(100);
  });

  it('validates correct RMA format', () => {
    expect(isValidRmaFormat('RMA-20260223-ABC123')).toBe(true);
    expect(isValidRmaFormat('RMA-20251231-Z9Y8X7')).toBe(true);
  });

  it('rejects invalid RMA formats', () => {
    expect(isValidRmaFormat('')).toBe(false);
    expect(isValidRmaFormat('RMA-2026022-ABC123')).toBe(false);
    expect(isValidRmaFormat('RMA-20260223-abc123')).toBe(false);
    expect(isValidRmaFormat('RMA-20260223-ABC12')).toBe(false);
    expect(isValidRmaFormat('RMA-20260223-ABC1234')).toBe(false);
    expect(isValidRmaFormat('rma-20260223-ABC123')).toBe(false);
    expect(isValidRmaFormat('XYZ-20260223-ABC123')).toBe(false);
    expect(isValidRmaFormat('RMA-ABCDEFGH-ABC123')).toBe(false);
  });

  it('validates generated RMA numbers pass format check', () => {
    for (let i = 0; i < 10; i++) {
      const rma = generateRmaNumber();

      expect(isValidRmaFormat(rma)).toBe(true);
    }
  });
});

describe('Return State Machine', () => {
  describe('canTransition', () => {
    it('allows requested to approved', () => {
      expect(canTransition('requested', 'approved')).toBe(true);
    });

    it('allows requested to rejected', () => {
      expect(canTransition('requested', 'rejected')).toBe(true);
    });

    it('allows approved to label_generated', () => {
      expect(canTransition('approved', 'label_generated')).toBe(true);
    });

    it('allows approved to shipped', () => {
      expect(canTransition('approved', 'shipped')).toBe(true);
    });

    it('allows label_generated to shipped', () => {
      expect(canTransition('label_generated', 'shipped')).toBe(true);
    });

    it('allows shipped to in_transit', () => {
      expect(canTransition('shipped', 'in_transit')).toBe(true);
    });

    it('allows in_transit to delivered', () => {
      expect(canTransition('in_transit', 'delivered')).toBe(true);
    });

    it('allows delivered to inspecting', () => {
      expect(canTransition('delivered', 'inspecting')).toBe(true);
    });

    it('allows inspecting to completed', () => {
      expect(canTransition('inspecting', 'completed')).toBe(true);
    });

    it('allows inspecting to rejected', () => {
      expect(canTransition('inspecting', 'rejected')).toBe(true);
    });

    it('rejects invalid transition from requested to shipped', () => {
      expect(canTransition('requested', 'shipped')).toBe(false);
    });

    it('rejects invalid transition from approved to completed', () => {
      expect(canTransition('approved', 'completed')).toBe(false);
    });

    it('rejects backward transition from shipped to approved', () => {
      expect(canTransition('shipped', 'approved')).toBe(false);
    });

    it('rejects transition from terminal state completed', () => {
      expect(canTransition('completed', 'requested')).toBe(false);
    });

    it('rejects transition from terminal state rejected', () => {
      expect(canTransition('rejected', 'requested')).toBe(false);
    });
  });

  describe('getNextStates', () => {
    it('returns approved and rejected for requested', () => {
      const next = getNextStates('requested');

      expect(next).toEqual(['approved', 'rejected']);
    });

    it('returns label_generated and shipped for approved', () => {
      const next = getNextStates('approved');

      expect(next).toEqual(['label_generated', 'shipped']);
    });

    it('returns shipped for label_generated', () => {
      const next = getNextStates('label_generated');

      expect(next).toEqual(['shipped']);
    });

    it('returns in_transit for shipped', () => {
      const next = getNextStates('shipped');

      expect(next).toEqual(['in_transit']);
    });

    it('returns delivered for in_transit', () => {
      const next = getNextStates('in_transit');

      expect(next).toEqual(['delivered']);
    });

    it('returns inspecting for delivered', () => {
      const next = getNextStates('delivered');

      expect(next).toEqual(['inspecting']);
    });

    it('returns completed and rejected for inspecting', () => {
      const next = getNextStates('inspecting');

      expect(next).toEqual(['completed', 'rejected']);
    });

    it('returns empty array for completed', () => {
      const next = getNextStates('completed');

      expect(next).toEqual([]);
    });

    it('returns empty array for rejected', () => {
      const next = getNextStates('rejected');

      expect(next).toEqual([]);
    });
  });

  describe('isTerminalState', () => {
    it('identifies completed as terminal', () => {
      expect(isTerminalState('completed')).toBe(true);
    });

    it('identifies rejected as terminal', () => {
      expect(isTerminalState('rejected')).toBe(true);
    });

    it('identifies requested as non-terminal', () => {
      expect(isTerminalState('requested')).toBe(false);
    });

    it('identifies approved as non-terminal', () => {
      expect(isTerminalState('approved')).toBe(false);
    });

    it('identifies shipped as non-terminal', () => {
      expect(isTerminalState('shipped')).toBe(false);
    });

    it('identifies inspecting as non-terminal', () => {
      expect(isTerminalState('inspecting')).toBe(false);
    });

    const nonTerminalStates: ReturnStatus[] = [
      'requested',
      'approved',
      'label_generated',
      'shipped',
      'in_transit',
      'delivered',
      'inspecting',
    ];

    for (const status of nonTerminalStates) {
      it(`identifies ${status} as non-terminal`, () => {
        expect(isTerminalState(status)).toBe(false);
      });
    }
  });
});
