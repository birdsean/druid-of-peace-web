import { describe, it, expect } from 'vitest';
import { calculateActionEffect, createActionEvents } from '../lib/actionEffects';
import type { ActionIntent } from '../lib/actionEffects';

describe('Action Effects', () => {
  describe('calculateActionEffect', () => {
    it('should calculate attack effects correctly', () => {
      const intent: ActionIntent = {
        actor: 'npc1',
        type: 'attack',
        target: 'npc2',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);
      
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('effect');
      expect(result.roll).toBeGreaterThanOrEqual(1);
      expect(result.roll).toBeLessThanOrEqual(6);
      expect(result.effect).toHaveProperty('description');
      expect(typeof result.effect.description).toBe('string');
    });

    it('should calculate defend effects correctly', () => {
      const intent: ActionIntent = {
        actor: 'npc1',
        type: 'defend',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);
      
      expect(result.effect).toHaveProperty('description');
      expect(result.effect.description).toContain('Defend');
    });

    it('should calculate peace aura effects correctly', () => {
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'peace_aura',
        target: 'npc1',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);
      
      expect(result.effect).toHaveProperty('willReduction');
      expect(result.effect).toHaveProperty('awarenessChange');
      expect(result.effect.willReduction).toBeGreaterThan(0);
    });

    it('should calculate observe effects correctly', () => {
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'observe',
        target: 'npc1',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);
      
      expect(result.effect).toHaveProperty('awarenessChange');
      expect(result.effect.awarenessChange).toBeLessThan(0);
    });

    it('should calculate meditate effects correctly', () => {
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'meditate',
        turnCounter: 1
      };

      const result = calculateActionEffect(intent);
      
      expect(result.effect).toHaveProperty('actionPointsGained');
      expect(result.effect.actionPointsGained).toBeGreaterThan(0);
    });
  });

  describe('createActionEvents', () => {
    it('should create events for attack actions', () => {
      const intent: ActionIntent = {
        actor: 'npc1',
        type: 'attack',
        target: 'npc2',
        turnCounter: 1
      };

      const events = createActionEvents(intent, 4, {
        damage: 15,
        description: 'Attack hits for 15 damage'
      });

      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      
      const event = events[0];
      expect(event).toHaveProperty('type', 'npc_action');
      expect(event).toHaveProperty('actor', 'npc1');
      expect(event.action).toContain('attack');
      expect(event).toHaveProperty('target', 'npc2');
    });

    it('should create events for peace aura actions', () => {
      const intent: ActionIntent = {
        actor: 'druid',
        type: 'peace_aura',
        target: 'npc1',
        turnCounter: 1
      };

      const events = createActionEvents(intent, 5, {
        willReduction: 10,
        awarenessChange: 5,
        description: 'Peace aura calms the NPC'
      });

      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      
      const event = events[0];
      expect(event).toHaveProperty('type', 'druid_action');
      expect(event).toHaveProperty('actor', 'druid');
      expect(event.action).toContain('peace_aura');
    });
  });
});