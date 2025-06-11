import { describe, it, expect } from 'vitest';
import { resolvePeaceAuraEffects, applyItemEffectsToState, advanceTurn } from '../lib/gameEngine';
import type { GameState } from '../lib/gameLogic';
import type { ItemEffect } from '../lib/inventory';

function createBaseState(currentTurn: 'npc1' | 'npc2' | 'druid', turnCounter = 1): GameState {
  return {
    currentTurn,
    turnCounter,
    npc1: {
      id: 'npc1',
      name: 'NPC 1',
      icon: '',
      color: '',
      description: '',
      position: 'left',
      stats: {
        health: 10,
        maxHealth: 10,
        armor: 0,
        maxArmor: 0,
        willToFight: 10,
        maxWill: 10,
        awareness: 5,
        maxAwareness: 100,
      },
      actions: [],
      animation: null,
    },
    npc2: {
      id: 'npc2',
      name: 'NPC 2',
      icon: '',
      color: '',
      description: '',
      position: 'right',
      stats: {
        health: 10,
        maxHealth: 10,
        armor: 0,
        maxArmor: 0,
        willToFight: 10,
        maxWill: 10,
        awareness: 5,
        maxAwareness: 100,
      },
      actions: [],
      animation: null,
    },
    druid: {
      id: 'druid',
      name: 'Druid',
      icon: '',
      color: '',
      stats: {
        hidden: true,
        actionPoints: 3,
        maxActionPoints: 3,
      },
      abilities: [],
    },
    gameOver: false,
    targetingMode: true,
    combatLog: [],
    gameOverState: null,
  };
}

describe('gameEngine', () => {
  it('resolvePeaceAuraEffects applies effects correctly', () => {
    const state = createBaseState('druid');
    const effect = { willReduction: 4, awarenessIncrease: 2 };
    const result = resolvePeaceAuraEffects(state, 'npc1', effect);

    expect(result.npc1.stats.willToFight).toBe(6);
    expect(result.npc1.stats.awareness).toBe(7);
    expect(result.npc2.stats.awareness).toBe(7);
    expect(result.druid.stats.actionPoints).toBe(2);
    expect(result.targetingMode).toBe(false);
  });

  it('applyItemEffectsToState modifies state and returns descriptions', () => {
    const state = createBaseState('druid');
    const effects: ItemEffect = { restoreAP: 2, reduceAwareness: 3, reduceWill: 2, targetAll: true };
    const { state: newState, descriptions } = applyItemEffectsToState(state, effects);

    expect(newState.druid.stats.actionPoints).toBe(3); // capped at max 3
    expect(newState.npc1.stats.awareness).toBe(2);
    expect(newState.npc2.stats.awareness).toBe(2);
    expect(newState.npc1.stats.willToFight).toBe(8);
    expect(newState.npc2.stats.willToFight).toBe(8);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it('advanceTurn cycles turns correctly', () => {
    let state = createBaseState('npc1', 1);
    state = advanceTurn(state);
    expect(state.currentTurn).toBe('npc2');
    expect(state.turnCounter).toBe(1);

    state = advanceTurn(state);
    expect(state.currentTurn).toBe('druid');
    expect(state.turnCounter).toBe(1);

    state = advanceTurn(state);
    expect(state.currentTurn).toBe('npc1');
    expect(state.turnCounter).toBe(2);
  });
});
