import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rollDice, executeNPCAction, calculatePeaceEffect } from '../gameLogic';

describe('Game Logic System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rollDice', () => {
    it('should return values within the specified range', () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        const roll = rollDice(1, 6);
        results.push(roll);
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      }
      
      // Check that we get a good distribution
      const uniqueValues = new Set(results);
      expect(uniqueValues.size).toBeGreaterThan(3); // Should have multiple different values
    });

    it('should handle different min and max values', () => {
      const roll = rollDice(10, 20);
      expect(roll).toBeGreaterThanOrEqual(10);
      expect(roll).toBeLessThanOrEqual(20);
    });

    it('should handle edge case where min equals max', () => {
      const roll = rollDice(5, 5);
      expect(roll).toBe(5);
    });

    it('should return integers only', () => {
      for (let i = 0; i < 50; i++) {
        const roll = rollDice(1, 6);
        expect(Number.isInteger(roll)).toBe(true);
      }
    });
  });

  describe('executeNPCAction', () => {
    it('should return attack action for high rolls', () => {
      const action = executeNPCAction(5);
      expect(action.type).toBe('attack');
      expect(action.description).toContain('attack');
    });

    it('should return defend action for low rolls', () => {
      const action = executeNPCAction(2);
      expect(action.type).toBe('defend');
      expect(action.description).toContain('defend');
    });

    it('should have consistent behavior for same roll values', () => {
      const action1 = executeNPCAction(4);
      const action2 = executeNPCAction(4);
      expect(action1.type).toBe(action2.type);
    });

    it('should handle edge cases', () => {
      const minAction = executeNPCAction(1);
      const maxAction = executeNPCAction(6);
      
      expect(['attack', 'defend']).toContain(minAction.type);
      expect(['attack', 'defend']).toContain(maxAction.type);
    });
  });

  describe('calculatePeaceEffect', () => {
    it('should calculate peace effects based on roll value', () => {
      const lowRollEffect = calculatePeaceEffect(1);
      const highRollEffect = calculatePeaceEffect(6);

      expect(lowRollEffect.willReduction).toBeGreaterThan(0);
      expect(lowRollEffect.awarenessIncrease).toBeGreaterThan(0);
      expect(highRollEffect.willReduction).toBeGreaterThanOrEqual(lowRollEffect.willReduction);
      expect(highRollEffect.awarenessIncrease).toBeGreaterThanOrEqual(lowRollEffect.awarenessIncrease);
    });

    it('should return consistent results for same roll', () => {
      const effect1 = calculatePeaceEffect(4);
      const effect2 = calculatePeaceEffect(4);

      expect(effect1.willReduction).toBe(effect2.willReduction);
      expect(effect1.awarenessIncrease).toBe(effect2.awarenessIncrease);
    });

    it('should handle all possible dice values', () => {
      for (let roll = 1; roll <= 6; roll++) {
        const effect = calculatePeaceEffect(roll);
        expect(effect.willReduction).toBeGreaterThan(0);
        expect(effect.awarenessIncrease).toBeGreaterThan(0);
        expect(typeof effect.willReduction).toBe('number');
        expect(typeof effect.awarenessIncrease).toBe('number');
      }
    });

    it('should scale effects appropriately with roll value', () => {
      const effects = [];
      for (let roll = 1; roll <= 6; roll++) {
        effects.push(calculatePeaceEffect(roll));
      }

      // Check that higher rolls generally produce better effects
      const maxWillReduction = Math.max(...effects.map(e => e.willReduction));
      const maxAwarenessIncrease = Math.max(...effects.map(e => e.awarenessIncrease));
      
      expect(maxWillReduction).toBeGreaterThan(effects[0].willReduction);
      expect(maxAwarenessIncrease).toBeGreaterThan(effects[0].awarenessIncrease);
    });
  });

  describe('Integration Tests', () => {
    it('should work together in a typical game flow', () => {
      // Simulate a turn
      const diceRoll = rollDice(1, 6);
      const npcAction = executeNPCAction(diceRoll);
      const peaceEffect = calculatePeaceEffect(diceRoll);

      expect(diceRoll).toBeGreaterThanOrEqual(1);
      expect(diceRoll).toBeLessThanOrEqual(6);
      expect(['attack', 'defend']).toContain(npcAction.type);
      expect(peaceEffect.willReduction).toBeGreaterThan(0);
      expect(peaceEffect.awarenessIncrease).toBeGreaterThan(0);
    });

    it('should maintain state consistency across multiple operations', () => {
      const operations = [];
      for (let i = 0; i < 10; i++) {
        const roll = rollDice(1, 6);
        const action = executeNPCAction(roll);
        const peace = calculatePeaceEffect(roll);
        operations.push({ roll, action, peace });
      }

      // Verify all operations completed successfully
      expect(operations).toHaveLength(10);
      operations.forEach(op => {
        expect(op.roll).toBeGreaterThanOrEqual(1);
        expect(op.roll).toBeLessThanOrEqual(6);
        expect(['attack', 'defend']).toContain(op.action.type);
        expect(op.peace.willReduction).toBeGreaterThan(0);
      });
    });
  });
});