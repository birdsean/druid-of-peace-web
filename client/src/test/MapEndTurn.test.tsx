import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['', mockSetLocation],
}));

const nextTurnMock = vi.fn();

vi.mock('../hooks/useMapState', () => ({
  useMapState: () => ({
    zones: [],
    currentZone: '',
    turnCounter: 1,
    activeEncounterZone: null,
    activeWeatherEffect: null,
    currentTimePhase: 'day1',
    setCurrentZone: vi.fn(),
    startEncounter: vi.fn(),
    resolveEncounter: vi.fn(),
    nextTurn: nextTurnMock,
  }),
}));

const logTurnAdvanceMock = vi.fn();
vi.mock('../hooks/useMapEvents', () => ({
  useMapEvents: () => ({
    addMapEvent: vi.fn(),
    logTurnAdvance: logTurnAdvanceMock,
    logEncounterStart: vi.fn(),
    logEncounterComplete: vi.fn(),
    logEncounterGenerated: vi.fn(),
    logZoneChange: vi.fn(),
    getEventLog: vi.fn(() => []),
  }),
}));

vi.mock('../lib/environmentLoader', () => ({
  loadEnvironmentalEffects: vi.fn().mockResolvedValue({ environmentalEffects: {} }),
}));

vi.mock('@/lib/timeSystem', async () => {
  const actual = await vi.importActual<typeof import('@/lib/timeSystem')>('@/lib/timeSystem');
  return {
    ...actual,
    globalTimeManager: {
      getState: () => ({ currentPhase: 'day1', phaseIndex: 0, turnCounter: 1 }),
      subscribe: () => () => {},
      getCurrentPhaseInfo: () => ({
        name: 'Early Day',
        icon: '🌅',
        effectId: 'daylight',
        colorPalette: { primary: '', secondary: '', accent: '', background: '' },
      }),
      getAllPhases: () => ['day1'],
      setPhase: vi.fn(),
      getPhaseInfo: () => ({
        name: 'Early Day',
        icon: '🌅',
        effectId: 'daylight',
        colorPalette: { primary: '', secondary: '', accent: '', background: '' },
      }),
    },
    getTimeBasedGradient: () => '',
    getTimeBasedEnvironmentalEffect: () => ({ id: 'daylight' }),
  };
});

vi.mock('@/lib/weatherSystem', () => ({
  globalWeatherManager: {
    loadWeatherData: vi.fn(),
    getActiveEnvironmentalEffect: vi.fn(() => null),
    checkForWeatherTrigger: vi.fn(),
    getWeatherState: vi.fn(() => ({ activeWeather: null })),
    subscribe: vi.fn(() => () => {}),
  },
  useWeatherState: () => null,
}));

import Map from '../pages/map';

describe('Map end turn', () => {
  beforeEach(() => {
    nextTurnMock.mockClear();
    logTurnAdvanceMock.mockClear();
    mockSetLocation.mockClear();
  });

  it('progresses the turn when end turn button clicked', () => {
    render(<Map />);
    fireEvent.click(screen.getByTitle('End Turn'));
    expect(nextTurnMock).toHaveBeenCalled();
    expect(logTurnAdvanceMock).toHaveBeenCalledWith(2);
  });
});
