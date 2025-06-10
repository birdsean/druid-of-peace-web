import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDiceRolling } from '../hooks/useDiceRolling';
import type { GameState } from '../lib/gameLogic';
import { TurnManager } from '../lib/turnManager';

vi.mock('../lib/turnManager');

function createBaseState(): GameState {
  return {
    currentTurn: 'druid',
    turnCounter: 1,
    npc1: {
      id: 'npc1',
      name: 'NPC1',
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
      name: 'NPC2',
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
      stats: { hidden: true, actionPoints: 1, maxActionPoints: 3 },
      abilities: [],
    },
    gameOver: false,
    targetingMode: false,
    combatLog: [],
    gameOverState: null,
  };
}

describe('useDiceRolling', () => {
  it('endTurn resets AP and advances turn', () => {
    const managerInstance = { setAutoTurnEnabled: vi.fn(), isCurrentlyExecuting: vi.fn(), executeTurn: vi.fn() };
    (TurnManager as any).mockImplementation(() => managerInstance);

    const state = createBaseState();
    const setGameState = vi.fn();
    const addLogEntry = vi.fn();
    const checkEnd = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() => useDiceRolling(state, setGameState, addLogEntry, checkEnd));

    act(() => {
      result.current.endTurn();
    });

    expect(setGameState).toHaveBeenCalledTimes(1);
    const updateFn = setGameState.mock.calls[0][0] as (s: GameState) => GameState;
    const newState = updateFn(state);
    expect(newState.currentTurn).toBe('npc1');
    // endTurn resets action points on the druid object
    expect((newState as any).druid.actionPoints).toBe(3);
  });

  it('setAutoTurnEnabled delegates to TurnManager', () => {
    const managerInstance = { setAutoTurnEnabled: vi.fn(), isCurrentlyExecuting: vi.fn(), executeTurn: vi.fn() };
    (TurnManager as any).mockImplementation(() => managerInstance);

    const state = createBaseState();
    const { result } = renderHook(() =>
      useDiceRolling(state, vi.fn(), vi.fn(), vi.fn().mockReturnValue(false)),
    );

    act(() => {
      result.current.setAutoTurnEnabled(false);
    });

    expect(managerInstance.setAutoTurnEnabled).toHaveBeenCalledWith(false);
  });
});
