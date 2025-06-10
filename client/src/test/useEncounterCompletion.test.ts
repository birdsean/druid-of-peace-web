import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEncounterCompletion } from '../hooks/useEncounterCompletion';
import { getGlobalMapState } from '../lib/mapState';

vi.mock('../lib/mapState');

describe('useEncounterCompletion', () => {
  it('calls resolveEncounter on global map state', () => {
    const resolveEncounter = vi.fn();
    (getGlobalMapState as any).mockReturnValue({
      resolveEncounter,
      currentEncounterZone: 'zone1',
    });

    const { result } = renderHook(() => useEncounterCompletion());

    act(() => {
      result.current(true);
    });

    expect(resolveEncounter).toHaveBeenCalledWith('zone1', true);
  });
});
