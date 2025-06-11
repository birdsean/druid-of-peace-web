import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../lib/locationLoader', () => ({
  loadLocationData: vi.fn().mockResolvedValue([])
}));

vi.mock('@/lib/timeSystem', async () => {
  const actual = await vi.importActual<typeof import('@/lib/timeSystem')>('@/lib/timeSystem');
  return {
    ...actual,
    applyPhaseColorPalette: vi.fn()
  };
});

describe('useMapState nextTurn', () => {
  beforeEach(async () => {
    const { globalTimeManager } = await import('@/lib/timeSystem');
    (globalTimeManager as any).state.turnCounter = 1;
    globalTimeManager.setPhase('day1');
  });

  it('increments turn counter once', async () => {
    const { useMapState } = await import('../hooks/useMapState');
    const { result } = renderHook(() => useMapState());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.nextTurn();
    });

    expect(result.current.turnCounter).toBe(2);
  });

  it('multiple calls advance sequentially', async () => {
    const { useMapState } = await import('../hooks/useMapState');
    const { result } = renderHook(() => useMapState());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.nextTurn();
    });
    act(() => {
      result.current.nextTurn();
    });

    expect(result.current.turnCounter).toBe(3);
  });
});
