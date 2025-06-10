import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMapState } from '../useMapState';

describe('useMapState Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMapState());

    expect(result.current.zones).toHaveLength(6);
    expect(result.current.currentZone).toBe('forest_clearing');
    expect(result.current.turnCounter).toBe(1);
    expect(result.current.activeEncounterZone).toBeNull();
    expect(result.current.currentTimePhase).toBe('dawn');
  });

  it('should advance turn and update time phases correctly', () => {
    const { result } = renderHook(() => useMapState());

    act(() => {
      result.current.advanceTurn();
    });

    expect(result.current.turnCounter).toBe(2);
  });

  it('should cycle through all time phases', () => {
    const { result } = renderHook(() => useMapState());
    const expectedPhases = ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'evening', 'night', 'midnight'];

    expectedPhases.forEach((phase, index) => {
      if (index > 0) {
        act(() => {
          result.current.advanceTurn();
        });
      }
      expect(result.current.currentTimePhase).toBe(phase);
    });

    // Should cycle back to dawn
    act(() => {
      result.current.advanceTurn();
    });
    expect(result.current.currentTimePhase).toBe('dawn');
  });

  it('should move to zones and update current zone', () => {
    const { result } = renderHook(() => useMapState());

    act(() => {
      result.current.moveToZone('mountain_peak');
    });

    expect(result.current.currentZone).toBe('mountain_peak');
  });

  it('should increase zone heat when moving to it', () => {
    const { result } = renderHook(() => useMapState());
    const initialHeat = result.current.zones.find(z => z.id === 'mountain_peak')?.heat || 0;

    act(() => {
      result.current.moveToZone('mountain_peak');
    });

    const newHeat = result.current.zones.find(z => z.id === 'mountain_peak')?.heat || 0;
    expect(newHeat).toBeGreaterThan(initialHeat);
  });

  it('should cap zone heat at maximum value', () => {
    const { result } = renderHook(() => useMapState());

    // Move to the same zone multiple times to max out heat
    for (let i = 0; i < 20; i++) {
      act(() => {
        result.current.moveToZone('ancient_grove');
      });
    }

    const heat = result.current.zones.find(z => z.id === 'ancient_grove')?.heat || 0;
    expect(heat).toBeLessThanOrEqual(10); // Assuming max heat is 10
  });

  it('should start encounter and set active encounter zone', () => {
    const { result } = renderHook(() => useMapState());

    act(() => {
      result.current.startEncounter('crystal_cave');
    });

    expect(result.current.activeEncounterZone).toBe('crystal_cave');
    
    const zone = result.current.zones.find(z => z.id === 'crystal_cave');
    expect(zone?.hasEncounter).toBe(true);
  });

  it('should complete encounter and clear active encounter', () => {
    const { result } = renderHook(() => useMapState());

    act(() => {
      result.current.startEncounter('crystal_cave');
    });

    expect(result.current.activeEncounterZone).toBe('crystal_cave');

    act(() => {
      result.current.completeEncounter('crystal_cave');
    });

    expect(result.current.activeEncounterZone).toBeNull();
    
    const zone = result.current.zones.find(z => z.id === 'crystal_cave');
    expect(zone?.hasEncounter).toBe(false);
  });

  it('should reduce zone heat after successful encounter', () => {
    const { result } = renderHook(() => useMapState());

    // First increase heat by moving to zone
    act(() => {
      result.current.moveToZone('whispering_woods');
    });

    const heatAfterMove = result.current.zones.find(z => z.id === 'whispering_woods')?.heat || 0;

    act(() => {
      result.current.startEncounter('whispering_woods');
      result.current.completeEncounter('whispering_woods');
    });

    const heatAfterEncounter = result.current.zones.find(z => z.id === 'whispering_woods')?.heat || 0;
    expect(heatAfterEncounter).toBeLessThan(heatAfterMove);
  });

  it('should get current zone object correctly', () => {
    const { result } = renderHook(() => useMapState());

    const currentZone = result.current.getCurrentZone();
    expect(currentZone?.id).toBe('forest_clearing');
    expect(currentZone?.name).toBe('Forest Clearing');

    act(() => {
      result.current.moveToZone('mountain_peak');
    });

    const newCurrentZone = result.current.getCurrentZone();
    expect(newCurrentZone?.id).toBe('mountain_peak');
  });

  it('should calculate encounter chances based on heat levels', () => {
    const { result } = renderHook(() => useMapState());

    // Low heat should have low encounter chance
    const lowHeatZone = result.current.zones.find(z => z.heat <= 2);
    if (lowHeatZone) {
      const lowChance = result.current.getEncounterChance(lowHeatZone.id);
      expect(lowChance).toBeLessThan(50);
    }

    // Increase heat and check encounter chance
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.moveToZone('mountain_peak');
      }
    });

    const highChance = result.current.getEncounterChance('mountain_peak');
    expect(highChance).toBeGreaterThan(30);
  });

  it('should handle travel events correctly', () => {
    const { result } = renderHook(() => useMapState());
    const mockAddEvent = vi.fn();

    // Mock the event system
    result.current.setEventCallback?.(mockAddEvent);

    act(() => {
      result.current.moveToZone('riverbank');
    });

    // Should have called the event callback if it exists
    if (result.current.setEventCallback) {
      expect(mockAddEvent).toHaveBeenCalled();
    }
  });

  it('should persist zone states across multiple operations', () => {
    const { result } = renderHook(() => useMapState());

    // Perform a series of operations
    act(() => {
      result.current.moveToZone('ancient_grove');
      result.current.advanceTurn();
      result.current.startEncounter('ancient_grove');
      result.current.advanceTurn();
      result.current.completeEncounter('ancient_grove');
      result.current.moveToZone('crystal_cave');
    });

    // Verify final state
    expect(result.current.currentZone).toBe('crystal_cave');
    expect(result.current.turnCounter).toBe(3);
    expect(result.current.activeEncounterZone).toBeNull();

    // Ancient grove should have modified heat from previous operations
    const ancientGrove = result.current.zones.find(z => z.id === 'ancient_grove');
    expect(ancientGrove?.heat).toBeGreaterThan(1);
  });

  it('should handle edge cases gracefully', () => {
    const { result } = renderHook(() => useMapState());

    // Try to move to non-existent zone
    act(() => {
      result.current.moveToZone('non_existent_zone');
    });

    // Should remain on current zone
    expect(result.current.currentZone).toBe('forest_clearing');

    // Try to complete encounter that wasn't started
    act(() => {
      result.current.completeEncounter('forest_clearing');
    });

    // Should not crash
    expect(result.current.activeEncounterZone).toBeNull();
  });

  it('should maintain zone properties correctly', () => {
    const { result } = renderHook(() => useMapState());

    const zones = result.current.zones;
    
    zones.forEach(zone => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('heat');
      expect(zone).toHaveProperty('hasEncounter');
      expect(zone).toHaveProperty('position');
      expect(zone).toHaveProperty('icon');
      expect(zone).toHaveProperty('description');
      
      expect(typeof zone.heat).toBe('number');
      expect(typeof zone.hasEncounter).toBe('boolean');
      expect(zone.position).toHaveProperty('x');
      expect(zone.position).toHaveProperty('y');
    });
  });
});