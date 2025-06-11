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

describe('useMapState action points', () => {
  beforeEach(async () => {
    const { globalTimeManager } = await import('@/lib/timeSystem');
    (globalTimeManager as any).state.turnCounter = 1;
    globalTimeManager.setPhase('day1');
  });

  it('initializes action points at max', async () => {
    const { useMapState } = await import('../hooks/useMapState');
    const { result } = renderHook(() => useMapState());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.actionPoints).toBe(1);
    expect(result.current.maxActionPoints).toBe(1);
  });

  it('spend and restore modify points within bounds', async () => {
    const { useMapState } = await import('../hooks/useMapState');
    const { result } = renderHook(() => useMapState());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.spendActionPoint();
    });
    expect(result.current.actionPoints).toBe(0);

    act(() => {
      result.current.spendActionPoint();
    });
    expect(result.current.actionPoints).toBe(0);

    act(() => {
      result.current.restoreActionPoints();
    });
    expect(result.current.actionPoints).toBe(1);
  });

  it('nextTurn resets action points to max', async () => {
    const { useMapState } = await import('../hooks/useMapState');
    const { result } = renderHook(() => useMapState());
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.spendActionPoint();
    });
    expect(result.current.actionPoints).toBe(0);

    act(() => {
      result.current.nextTurn();
    });

    expect(result.current.actionPoints).toBe(result.current.maxActionPoints);
  });
});
