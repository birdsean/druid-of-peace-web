import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDiceActionSystem } from '../lib/diceActionSystem';
import { globalHistoryManager } from '../lib/historySystem';
import type { ActionIntent, ActionEffect } from '../lib/actionEffects';
import * as actionEffects from '../lib/actionEffects';

const mockEffect: ActionEffect = {
  willReduction: 10,
  awarenessChange: 5,
  description: 'mock effect'
};

describe('useDiceActionSystem', () => {
  let addBattleEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    addBattleEvent = vi.fn();
    vi.spyOn(actionEffects, 'calculateActionEffect').mockReturnValue({ roll: 4, effect: mockEffect });
    vi.spyOn(globalHistoryManager, 'addPlayerAction').mockImplementation(() => {});
    globalHistoryManager.debugReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('executeAction updates state, creates events and records history', async () => {
    const { result } = renderHook(() => useDiceActionSystem(addBattleEvent));
    const intent: ActionIntent = { actor: 'druid', type: 'peace_aura', target: 'npc1', turnCounter: 1 };

    let promise: Promise<any>;
    act(() => {
      promise = result.current.executeAction(intent);
    });

    // Rolling state set immediately
    expect(result.current.diceActionState.isRolling).toBe(true);
    expect(result.current.diceActionState.pendingAction).toEqual(intent);
    expect(addBattleEvent).toHaveBeenCalledTimes(1);
    expect(addBattleEvent.mock.calls[0][0]).toEqual(expect.objectContaining({ action: 'peace_aura_intent', actor: 'druid', type: 'druid_action', turn: 1 }));

    act(() => {
      vi.runAllTimers();
    });
    const res = await promise;

    expect(res).toEqual({ roll: 4, effect: mockEffect });
    expect(addBattleEvent).toHaveBeenCalledTimes(2);
    expect(addBattleEvent.mock.calls[1][0]).toEqual(expect.objectContaining({ action: 'peace_aura_effect', result: 'mock effect' }));

    expect(result.current.diceActionState.isRolling).toBe(false);
    expect(result.current.diceActionState.pendingAction).toBeNull();
    expect(result.current.diceActionState.lastRoll).toBe(4);
    expect(result.current.diceActionState.lastEffect).toEqual(mockEffect);
    expect(globalHistoryManager.addPlayerAction).toHaveBeenCalledWith({ type: 'peace_aura', target: 'npc1', roll: 4, effect: mockEffect });
  });

  it('clearLastAction resets the last result', async () => {
    const { result } = renderHook(() => useDiceActionSystem(addBattleEvent));
    const intent: ActionIntent = { actor: 'druid', type: 'peace_aura', target: 'npc1', turnCounter: 1 };

    let promise: Promise<any>;
    act(() => {
      promise = result.current.executeAction(intent);
    });
    act(() => {
      vi.runAllTimers();
    });
    await promise;

    expect(result.current.diceActionState.lastRoll).not.toBeNull();
    expect(result.current.diceActionState.lastEffect).not.toBeNull();

    act(() => {
      result.current.clearLastAction();
    });

    expect(result.current.diceActionState.lastRoll).toBeNull();
    expect(result.current.diceActionState.lastEffect).toBeNull();
  });
});
