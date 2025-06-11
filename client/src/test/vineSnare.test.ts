import { describe, it, expect, vi } from 'vitest';
import { vineSnare } from '../abilities/vineSnare';
import type { GameContext } from '../abilities/types';

describe('vineSnare ability', () => {
  it('start sets pending ability and targeting mode', () => {
    const ctx: GameContext = {
      gameState: {} as any,
      setTargetingMode: vi.fn(),
      setPendingAbility: vi.fn(),
      clearPendingAbility: vi.fn(),
      useAbility: vi.fn(),
      triggerGameOver: vi.fn(),
    };

    vineSnare.start?.(ctx);
    expect(ctx.setPendingAbility).toHaveBeenCalledWith('vineSnare');
    expect(ctx.setTargetingMode).toHaveBeenCalledWith(true);
  });

  it('execute calls useAbility and clears state', () => {
    const ctx: GameContext = {
      gameState: {} as any,
      setTargetingMode: vi.fn(),
      setPendingAbility: vi.fn(),
      clearPendingAbility: vi.fn(),
      useAbility: vi.fn(),
      triggerGameOver: vi.fn(),
    };

    vineSnare.execute?.(ctx, 'npc1');
    expect(ctx.useAbility).toHaveBeenCalledWith('vineSnare', 'npc1');
    expect(ctx.clearPendingAbility).toHaveBeenCalled();
    expect(ctx.setTargetingMode).toHaveBeenCalledWith(false);
  });
});
