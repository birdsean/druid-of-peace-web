import { describe, it, expect } from 'vitest';
import { rollDice, executeNPCAction, calculatePeaceEffect } from '../lib/gameLogic';

describe('Game Logic', () => {
  describe('rollDice', () => {
    it('should return a number between min and max inclusive', () => {
      const result = rollDice(1, 6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle custom ranges', () => {
      const result = rollDice(10, 20);
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(20);
    });

    it('should handle single value range', () => {
      const result = rollDice(5, 5);
      expect(result).toBe(5);
    });
  });

  describe('executeNPCAction', () => {
    it('should return attack action for low rolls', () => {
      const result = executeNPCAction(1);
      expect(result.type).toBe('attack');
      expect(result.description).toContain('attacks');
    });

    it('should return defend action for high rolls', () => {
      const result = executeNPCAction(6);
      expect(result.type).toBe('defend');
      expect(result.description).toContain('defends');
    });

    it('should return valid action structure', () => {
      const result = executeNPCAction(3);
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('description');
      expect(['attack', 'defend']).toContain(result.type);
      expect(typeof result.description).toBe('string');
    });
  });

  describe('calculatePeaceEffect', () => {
    it('should return peace effect with will reduction and awareness increase', () => {
      const result = calculatePeaceEffect(4);
      expect(result).toHaveProperty('willReduction');
      expect(result).toHaveProperty('awarenessIncrease');
      expect(typeof result.willReduction).toBe('number');
      expect(typeof result.awarenessIncrease).toBe('number');
    });

    it('should have different effects for different rolls', () => {
      const lowRoll = calculatePeaceEffect(1);
      const highRoll = calculatePeaceEffect(6);
      
      expect(lowRoll.willReduction).toBeGreaterThan(0);
      expect(lowRoll.awarenessIncrease).toBeGreaterThan(0);
      expect(highRoll.willReduction).toBeGreaterThan(0);
      expect(highRoll.awarenessIncrease).toBeGreaterThan(0);
    });
  });
});