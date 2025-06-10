import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMapEvents } from '../hooks/useMapEvents';

// Tests for useMapEvents hook

describe('useMapEvents hook', () => {
  it('appends events and formats log correctly', () => {
    const { result } = renderHook(() => useMapEvents());

    act(() => {
      result.current.logTurnAdvance(1);
      result.current.logEncounterStart(1, 'zone1', 'Forest');
      result.current.logEncounterComplete(1, 'zone1', 'Forest', true);
      result.current.logZoneChange(2, 'zone2', 'Town');
    });

    const types = result.current.mapEvents.map(e => e.type);
    expect(types).toEqual([
      'turn_advance',
      'encounter_start',
      'encounter_complete',
      'zone_change',
    ]);

    expect(result.current.getEventLog()).toEqual([
      'Turn 1',
      'Encounter started in Forest',
      'Encounter successful in Forest',
      'Moved to Town',
    ]);
  });
});
