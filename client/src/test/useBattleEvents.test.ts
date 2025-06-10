import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBattleEvents } from '../hooks/useBattleEvents';
import { createBattleEvent } from '../lib/events';
import type { GameState } from '../lib/gameLogic';

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
        awareness: 0,
        maxAwareness: 100,
      },
      actions: [],
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
        awareness: 0,
        maxAwareness: 100,
      },
      actions: [],
    },
    druid: {
      id: 'druid',
      name: 'Druid',
      icon: '',
      color: '',
      stats: { hidden: true, actionPoints: 3, maxActionPoints: 3 },
      abilities: [],
    },
    gameOver: false,
    targetingMode: false,
    combatLog: ['Turn 1: Combat begins'],
    gameOverState: null,
  };
}

describe('useBattleEvents', () => {
  it('adds battle events and updates combat log', () => {
    const setGameState = vi.fn();
    const { result } = renderHook(() => useBattleEvents(setGameState));

    expect(result.current.battleEvents).toHaveLength(1);

    const event = createBattleEvent(2, 'npc_action', 'npc1', {
      action: 'slash',
      result: 'hit',
    });

    act(() => {
      result.current.addBattleEvent(event);
    });

    expect(result.current.battleEvents).toHaveLength(2);
    expect(setGameState).toHaveBeenCalledTimes(1);

    const updateFn = setGameState.mock.calls[0][0] as (s: GameState) => GameState;
    const newState = updateFn(createBaseState('npc1'));
    expect(newState.combatLog[newState.combatLog.length - 1]).toBe(
      `Turn 2: Gareth slash (hit)`
    );
  });
});
