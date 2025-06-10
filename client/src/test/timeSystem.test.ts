import { describe, it, expect } from 'vitest';
import { TimeManager, getTimeBasedEnvironmentalEffect, getTimeBasedGradient, applyPhaseColorPalette } from '../lib/timeSystem';


describe('Time System', () => {
  it('advancePhase cycles phases and increments turn counters', () => {
    const manager = new TimeManager('day1', 1);
    const phases = manager.getAllPhases();

    phases.forEach((phase, idx) => {
      const state = manager.advancePhase();
      const expectedPhase = phases[(idx + 1) % phases.length];
      expect(state.currentPhase).toBe(expectedPhase);
      expect(state.turnCounter).toBe(idx + 2);
    });
  });

  it('setPhase correctly updates the current phase', () => {
    const manager = new TimeManager('day1', 5);
    const state = manager.setPhase('night2');

    expect(state.currentPhase).toBe('night2');
    expect(state.phaseIndex).toBe(manager.getAllPhases().indexOf('night2'));
    expect(state.turnCounter).toBe(5);
  });

  it('getTimeBasedEnvironmentalEffect returns correct effect structure', () => {
    const effect = getTimeBasedEnvironmentalEffect('dusk');

    expect(effect).toEqual({
      id: 'dusk',
      zone_id: null,
      appliesIn: 'battle',
      type: 'dynamic',
      duration: 1
    });
  });

  it('getTimeBasedGradient returns the expected gradient string', () => {
    const gradient = getTimeBasedGradient('day1');
    expect(gradient).toBe('bg-gradient-to-b from-sky-300 via-blue-200 to-green-300');
  });

  it('applyPhaseColorPalette sets CSS variables on the element', () => {
    const manager = new TimeManager();
    const element = document.createElement('div');
    applyPhaseColorPalette('dusk', element);

    const palette = manager.getPhaseInfo('dusk').colorPalette;
    expect(element.style.getPropertyValue('--time-primary')).toBe(palette.primary);
    expect(element.style.getPropertyValue('--time-secondary')).toBe(palette.secondary);
    expect(element.style.getPropertyValue('--time-accent')).toBe(palette.accent);
    expect(element.style.getPropertyValue('--time-background')).toBe(palette.background);
  });
});
