import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const loadLocationDataMock = vi.fn().mockResolvedValue([]);
vi.mock('../lib/locationLoader', () => ({
  loadLocationData: loadLocationDataMock
}));

const loadMapActionsMock = vi.fn();
vi.mock('../lib/mapActionLoader', () => ({
  loadMapActions: loadMapActionsMock
}));

vi.mock('@/lib/timeSystem', async () => {
  const actual = await vi.importActual<typeof import('@/lib/timeSystem')>('@/lib/timeSystem');
  return {
    ...actual,
    applyPhaseColorPalette: vi.fn()
  };
});

describe('useMapState mapActions', () => {
  beforeEach(async () => {
    const { globalTimeManager } = await import('@/lib/timeSystem');
    (globalTimeManager as any).state.turnCounter = 1;
    globalTimeManager.setPhase('day1');
    loadMapActionsMock.mockResolvedValue([
      {
        key: 'travel',
        name: 'Travel',
        description: 'Move to a nearby zone',
        icon: '🧭',
        cost: 1,
      },
    ]);
  });

  it('loads actions into state', async () => {
    const { useMapState } = await import('../hooks/useMapState');
    const { result } = renderHook(() => useMapState());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.mapActions.length).toBe(1);
    expect(result.current.mapActions[0].key).toBe('travel');
  });
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
