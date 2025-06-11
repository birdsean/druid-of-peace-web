import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['', mockSetLocation],
}));

const startEncounterMock = vi.fn();
const setCurrentZoneMock = vi.fn();
const resolveEncounterMock = vi.fn();

vi.mock('../hooks/useMapState', () => ({
  useMapState: () => ({
    zones: [
      {
        id: 'forest',
        name: 'Forest',
        heat: 10,
        hasEncounter: true,
        position: { x: 50, y: 50 },
        icon: '🌲',
        description: '',
        environmentEffect: 'mist',
      },
    ],
    currentZone: '',
    turnCounter: 2,
    activeEncounterZone: null,
    activeWeatherEffect: null,
    currentTimePhase: 'day1',
    setCurrentZone: setCurrentZoneMock,
    startEncounter: startEncounterMock,
    resolveEncounter: resolveEncounterMock,
    nextTurn: vi.fn(),
  }),
}));

vi.mock('../hooks/useMapEvents', () => ({
  useMapEvents: () => ({
    addMapEvent: vi.fn(),
    logTurnAdvance: vi.fn(),
    logEncounterStart: vi.fn(),
    logEncounterComplete: vi.fn(),
    logZoneChange: vi.fn(),
    getEventLog: vi.fn(() => []),
  }),
}));

vi.mock('../lib/environmentLoader', () => ({
  loadEnvironmentalEffects: vi.fn().mockResolvedValue({ environmentalEffects: {} }),
}));

vi.mock('@/lib/timeSystem', async () => {
  const actual = await vi.importActual<typeof import('@/lib/timeSystem')>(
    '@/lib/timeSystem'
  );
  return {
    ...actual,
    globalTimeManager: {
      getState: () => ({ currentPhase: 'day1', phaseIndex: 0, turnCounter: 2 }),
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
    getActiveEnvironmentalEffect: vi.fn(() => 'rain'),
    checkForWeatherTrigger: vi.fn(),
    getWeatherState: vi.fn(() => ({ activeWeather: null })),
    subscribe: vi.fn(() => () => {}),
  },
  useWeatherState: () => null,
}));

import { globalHistoryManager } from '../lib/historySystem';
import { debugReset } from '../lib/historyDebug';
import Map from '../pages/map';

describe('Map encounter history', () => {
  beforeEach(() => {
    debugReset(globalHistoryManager);
    vi.restoreAllMocks();
    startEncounterMock.mockClear();
    setCurrentZoneMock.mockClear();
    resolveEncounterMock.mockClear();
    mockSetLocation.mockClear();
  });

  it('records encounter start when zone clicked', async () => {
    const spy = vi.spyOn(globalHistoryManager, 'startEncounter');
    render(<Map />);

    fireEvent.click(screen.getByText('Forest'));

    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[0]).toBe('forest');
    expect(args[1]).toBe('Forest');
    expect(args[2]).toBe(2);
  });
});
