import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { globalWeatherManager, type WeatherData } from '../lib/weatherSystem';

const mockWeatherData: WeatherData = {
  weatherEffects: {
    rain: {
      id: 'rain',
      name: 'Rain',
      description: 'Rainy weather',
      icon: '🌧️',
      season: 'spring',
      effects: [],
      min_duration: 1,
      max_duration: 2,
      trigger_chance: 0.7,
      environmental_effect: 'wet'
    },
    sun: {
      id: 'sun',
      name: 'Sunny',
      description: 'Sunny weather',
      icon: '☀️',
      season: 'summer',
      effects: [],
      min_duration: 1,
      max_duration: 2,
      trigger_chance: 0.3,
      environmental_effect: 'bright'
    }
  }
};

const resetManager = async () => {
  (globalWeatherManager as any).weatherData = null;
  (globalWeatherManager as any).weatherState = {
    activeWeather: null,
    lastWeatherCheck: 0,
    weatherHistory: []
  };
  await globalWeatherManager.loadWeatherData();
};

describe('Weather System', () => {
  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => mockWeatherData }));
    await resetManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('checkForWeatherTrigger ends active weather when duration expires', () => {
    const manager: any = globalWeatherManager;
    manager.weatherState.activeWeather = {
      effect: mockWeatherData.weatherEffects.rain,
      remainingTurns: 1,
      startTurn: 5
    };
    const listener = vi.fn();
    const unsubscribe = globalWeatherManager.subscribe(listener);

    const changed = globalWeatherManager.checkForWeatherTrigger(6);

    expect(changed).toBe(true);
    expect(manager.weatherState.activeWeather).toBeNull();
    expect(manager.weatherState.weatherHistory).toHaveLength(1);
    expect(manager.weatherState.weatherHistory[0]).toMatchObject({ weatherId: 'rain', startTurn: 5, endTurn: 6 });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('checkForWeatherTrigger triggers random weather when chance succeeds', () => {
    const manager: any = globalWeatherManager;
    manager.weatherState.lastWeatherCheck = 0;

    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy.mockReturnValueOnce(0); // roll < triggerChance
    randomSpy.mockReturnValueOnce(0.1); // weighted select rain
    randomSpy.mockReturnValueOnce(0); // duration -> min

    const changed = globalWeatherManager.checkForWeatherTrigger(20);

    expect(changed).toBe(true);
    expect(manager.weatherState.activeWeather?.effect.id).toBe('rain');
    expect(manager.weatherState.activeWeather?.startTurn).toBe(20);

    randomSpy.mockRestore();
  });

  it('triggerRandomWeather selects weighted effects', () => {
    const manager: any = globalWeatherManager;
    manager.weatherState.activeWeather = null;

    const randomSpy = vi.spyOn(Math, 'random');
    // Select rain
    randomSpy.mockReturnValueOnce(0.05).mockReturnValueOnce(0); // duration
    globalWeatherManager.triggerRandomWeather(1);
    expect(manager.weatherState.activeWeather?.effect.id).toBe('rain');

    // Clear and select sun
    manager.weatherState.activeWeather = null;
    randomSpy.mockReturnValueOnce(0.9).mockReturnValueOnce(0); // duration
    globalWeatherManager.triggerRandomWeather(2);
    expect(manager.weatherState.activeWeather?.effect.id).toBe('sun');

    randomSpy.mockRestore();
  });

  it('triggerSpecificWeather and clearWeather notify listeners', () => {
    const manager: any = globalWeatherManager;
    const listener = vi.fn();
    const unsubscribe = globalWeatherManager.subscribe(listener);

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const success = globalWeatherManager.triggerSpecificWeather('sun', 3);
    expect(success).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(manager.weatherState.activeWeather?.effect.id).toBe('sun');

    globalWeatherManager.clearWeather(4);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(manager.weatherState.activeWeather).toBeNull();
    expect(manager.weatherState.weatherHistory).toHaveLength(1);

    unsubscribe();
    randomSpy.mockRestore();
  });
});
