import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock useDiceActionSystem before importing the hook
vi.mock('../lib/diceActionSystem', () => ({
  useDiceActionSystem: vi.fn(),
}));

import { useEnhancedGameState } from '../lib/enhancedGameState';
import { useDiceActionSystem } from '../lib/diceActionSystem';

describe('useEnhancedGameState', () => {
  let executeAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    executeAction = vi.fn();
    (useDiceActionSystem as any).mockReturnValue({
      diceActionState: { isRolling: false, pendingAction: null, lastRoll: null, lastEffect: null },
      executeAction,
      clearLastAction: vi.fn(),
    });
  });

  it('performPeaceAction updates NPC stats and action points', async () => {
    executeAction.mockResolvedValue({ roll: 4, effect: { willReduction: 10, awarenessChange: 5 } });
    const { result } = renderHook(() => useEnhancedGameState());

    await act(async () => {
      await result.current.performPeaceAction('npc1');
    });

    expect(result.current.gameState.npc1.stats.willToFight).toBe(50);
    expect(result.current.gameState.npc1.stats.awareness).toBe(25);
    expect(result.current.gameState.npc2.stats.awareness).toBe(35);
    expect(result.current.gameState.druid.stats.actionPoints).toBe(2);
  });

  it('performNPCAction applies attack damage', async () => {
    executeAction.mockResolvedValue({ roll: 3, effect: { damage: 10, armorDamage: 0 } });
    const { result } = renderHook(() => useEnhancedGameState());

    await act(async () => {
      await result.current.performNPCAction('npc1', 'attack');
    });

    expect(result.current.gameState.npc2.stats.health).toBe(60);
    expect(result.current.gameState.npc2.stats.armor).toBe(20);
    expect(result.current.gameState.npc2.stats.willToFight).toBe(45);
  });

  it('performNPCAction applies defend healing', async () => {
    executeAction.mockResolvedValue({ roll: 2, effect: { healing: 5 } });
    const { result } = renderHook(() => useEnhancedGameState());

    act(() => {
      result.current.setGameState(prev => ({
        ...prev,
        npc1: { ...prev.npc1, stats: { ...prev.npc1.stats, health: 60 } },
      }));
    });

    await act(async () => {
      await result.current.performNPCAction('npc1', 'defend');
    });

    expect(result.current.gameState.npc1.stats.health).toBe(65);
  });
});
