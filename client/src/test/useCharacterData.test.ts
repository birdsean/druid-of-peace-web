import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCharacterData } from '../hooks/useCharacterData';
import * as loader from '../lib/characterLoader';
import * as engine from '../lib/gameEngine';
import type { GameState } from '../lib/gameLogic';

vi.mock('../lib/characterLoader');
vi.mock('../lib/gameEngine', async () => {
  const actual = await vi.importActual<typeof engine>('../lib/gameEngine');
  return { ...actual, applyItemEffectsToState: vi.fn() };
});

function createBaseState(): GameState {
  return {
    currentTurn: 'druid',
    turnCounter: 1,
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
      stats: { hidden: true, actionPoints: 2, maxActionPoints: 3 },
      abilities: [],
    },
    gameOver: false,
    targetingMode: false,
    combatLog: [],
    gameOverState: null,
  };
}

beforeEach(() => {
  (loader.loadNPCData as any).mockResolvedValue([]);
  (loader.loadPCData as any).mockResolvedValue(null);
});

describe('useCharacterData', () => {
  it('applyItemEffects applies effects and logs', () => {
    const state = createBaseState();
    const setGameState = vi.fn((fn: (s: GameState) => GameState) => {
      Object.assign(state, fn(state));
    });
    const addBattleEvent = vi.fn();
    const addLogEntry = vi.fn();

    (engine.applyItemEffectsToState as any).mockReturnValue({
      state: { ...state, druid: { ...state.druid, stats: { ...state.druid.stats, actionPoints: 3 } } },
      descriptions: ['AP +1'],
    });

    const { result } = renderHook(() =>
      useCharacterData(state, setGameState, addBattleEvent, addLogEntry),
    );

    act(() => {
      result.current.applyItemEffects({ restoreAP: 1 }, 'Potion');
    });

    expect(engine.applyItemEffectsToState).toHaveBeenCalled();
    expect(addBattleEvent).toHaveBeenCalledTimes(1);
    expect(addLogEntry).toHaveBeenCalledWith('Used Potion: AP +1');
    expect(state.druid.stats.actionPoints).toBe(3);
  });
});
