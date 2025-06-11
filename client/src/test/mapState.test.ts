import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('mapState', () => {
  it('setGlobalMapState stores provided object and getGlobalMapState returns it', async () => {
    const mod = await import('../lib/mapState');
    const { setGlobalMapState, getGlobalMapState } = mod;
    const state = { resolveEncounter: vi.fn(), currentEncounterZone: 'zone1' };
    setGlobalMapState(state);
    expect(getGlobalMapState()).toBe(state);
  });

  it('setCurrentEncounterZone updates currentEncounterZone', async () => {
    const mod = await import('../lib/mapState');
    const { setGlobalMapState, getGlobalMapState, setCurrentEncounterZone, getCurrentEncounterZone } = mod;
    const state = { resolveEncounter: vi.fn(), currentEncounterZone: 'start' };
    setGlobalMapState(state);
    setCurrentEncounterZone('zone2');
    expect(getCurrentEncounterZone()).toBe('zone2');
    expect(getGlobalMapState().currentEncounterZone).toBe('zone2');
  });

  it('stores and retrieves activeWeatherEffect', async () => {
    const mod = await import('../lib/mapState');
    const { setGlobalMapState, getActiveWeatherEffect, setActiveWeatherEffect } = mod;
    setGlobalMapState({ resolveEncounter: vi.fn(), activeWeatherEffect: 'rain' });
    expect(getActiveWeatherEffect()).toBe('rain');
    setActiveWeatherEffect('mist');
    expect(getActiveWeatherEffect()).toBe('mist');
  });
});
