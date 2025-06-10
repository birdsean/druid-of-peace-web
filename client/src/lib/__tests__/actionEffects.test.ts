import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateActionEffect, createActionEvents, ActionIntent } from '../actionEffects';

// Mock the dice roll function
vi.mock('../gameLogic', () => ({
  rollDice: vi.fn()
}));

import { rollDice } from '../gameLogic';

describe('Action Effects System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateActionEffect', () => {
    it('should calculate attack effects correctly', () => {
      vi.mocked(rollDice).mockReturnValue(5);
      
      const intent: ActionIntent = {
        actor: 'npc1',
        type: 'attack',
        target: 'npc2',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);

      expect(result.roll).toBe(5);
      expect(result.effect.damage).toBeGreaterThan(0);
      expect(result.effect.description).toContain('attack');
    });

    it('should calculate peace aura effects correctly', () => {
      vi.mocked(rollDice).mockReturnValue(4);
      
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'peace_aura',
        target: 'npc1',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);

      expect(result.roll).toBe(4);
      expect(result.effect.willReduction).toBeGreaterThan(0);
      expect(result.effect.awarenessChange).toBeGreaterThan(0);
      expect(result.effect.description).toContain('peaceful');
    });

    it('should calculate defend effects correctly', () => {
      vi.mocked(rollDice).mockReturnValue(6);
      
      const intent: ActionIntent = {
        actor: 'npc1',
        type: 'defend',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);

      expect(result.roll).toBe(6);
      expect(result.effect.description).toContain('defensive');
    });

    it('should calculate observe effects correctly', () => {
      vi.mocked(rollDice).mockReturnValue(3);
      
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'observe',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);

      expect(result.roll).toBe(3);
      expect(result.effect.awarenessChange).toBeGreaterThan(0);
      expect(result.effect.description).toContain('observe');
    });

    it('should calculate meditate effects correctly', () => {
      vi.mocked(rollDice).mockReturnValue(5);
      
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'meditate',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);

      expect(result.roll).toBe(5);
      expect(result.effect.actionPointsGained).toBeGreaterThan(0);
      expect(result.effect.description).toContain('meditate');
    });

    it('should handle different roll values appropriately', () => {
      const intent: ActionIntent = {
        actor: 'npc1',
        type: 'attack',
        target: 'druid',
        turnCounter: 1
      };

      // Test low roll
      vi.mocked(rollDice).mockReturnValue(1);
      const lowRoll = calculateActionEffect(intent);
      
      // Test high roll
      vi.mocked(rollDice).mockReturnValue(6);
      const highRoll = calculateActionEffect(intent);

      expect(highRoll.effect.damage).toBeGreaterThan(lowRoll.effect.damage || 0);
    });
  });

  describe('createActionEvents', () => {
    it('should create action events with correct structure', () => {
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'peace_aura',
        target: 'npc1',
        turnCounter: 5
      };

      const effect = {
        willReduction: 2,
        awarenessChange: 1,
        description: 'Peaceful aura calms the target'
      };

      const events = createActionEvents(intent, 4, effect);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'druid_action',
        actor: 'druid',
        action: 'peace_aura',
        target: 'npc1',
        turn: 5
      });
      expect(events[0].id).toBeDefined();
      expect(events[0].timestamp).toBeDefined();
    });

    it('should handle events without targets', () => {
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'meditate',
        turnCounter: 3
      };

      const effect = {
        actionPointsGained: 1,
        description: 'Meditation restores action points'
      };

      const events = createActionEvents(intent, 5, effect);

      expect(events).toHaveLength(1);
      expect(events[0].target).toBeUndefined();
      expect(events[0].action).toBe('meditate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid action types gracefully', () => {
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'invalid_action' as any,
        turnCounter: 1
      };

      expect(() => calculateActionEffect(intent)).not.toThrow();
    });

    it('should maintain consistency across multiple calculations', () => {
      vi.mocked(rollDice).mockReturnValue(4);
      
      const intent: ActionIntent = {
        actor: 'npc1',
        type: 'attack',
        target: 'npc2',
        turnCounter: 1
      };

      const result1 = calculateActionEffect(intent);
      const result2 = calculateActionEffect(intent);

      expect(result1.roll).toBe(result2.roll);
      expect(result1.effect.damage).toBe(result2.effect.damage);
    });
  });
});