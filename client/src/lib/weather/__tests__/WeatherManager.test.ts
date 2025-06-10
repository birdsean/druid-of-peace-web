import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WeatherManager } from '../WeatherManager';
import fs from 'fs/promises';

const weatherPath = 'data/weather/weather-effects.json';

let manager: WeatherManager;

async function mockFetch() {
  const data = await fs.readFile(weatherPath, 'utf-8');
  return new Response(data, { status: 200 });
}

beforeEach(() => {
  manager = new WeatherManager();
  vi.stubGlobal('fetch', vi.fn(mockFetch));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WeatherManager', () => {
  it('loads weather data', async () => {
    await manager.loadWeatherData();
    expect(manager.getWeatherData()).not.toBeNull();
    expect(fetch).toHaveBeenCalled();
  });

  it('triggers specific weather and records history', async () => {
    await manager.loadWeatherData();
    const first = manager.triggerSpecificWeather('gentle_rain', 5);
    expect(first).toBe(true);
    const state1 = manager.getWeatherState();
    expect(state1.activeWeather?.effect.id).toBe('gentle_rain');
    expect(state1.lastWeatherCheck).toBe(5);

    const second = manager.triggerSpecificWeather('morning_mist', 7);
    expect(second).toBe(true);
    const state2 = manager.getWeatherState();
    expect(state2.activeWeather?.effect.id).toBe('morning_mist');
    expect(state2.weatherHistory.length).toBe(1);
    expect(state2.weatherHistory[0]).toEqual({
      weatherId: 'gentle_rain',
      startTurn: 5,
      endTurn: 7,
    });
  });

  it('expires active weather on check', async () => {
    await manager.loadWeatherData();
    manager.triggerSpecificWeather('gentle_rain', 10);
    // force remaining turns to 1
    const state = manager.getWeatherState();
    if (state.activeWeather) {
      state.activeWeather.remainingTurns = 1;
      // replace internal state
      (manager as any).weatherState = state;
    }
    const changed = manager.checkForWeatherTrigger(11);
    const result = manager.getWeatherState();
    expect(changed).toBe(true);
    expect(result.activeWeather).toBeNull();
    expect(result.weatherHistory.length).toBe(1);
    expect(result.weatherHistory[0].endTurn).toBe(11);
  });

  it('does not trigger too early', async () => {
    await manager.loadWeatherData();
    const changed = manager.checkForWeatherTrigger(5);
    expect(changed).toBe(false);
    expect(manager.getWeatherState().activeWeather).toBeNull();
  });

  it('triggers random weather after threshold', async () => {
    await manager.loadWeatherData();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const changed = manager.checkForWeatherTrigger(20);
    const state = manager.getWeatherState();
    expect(changed).toBe(true);
    expect(state.activeWeather).not.toBeNull();
    expect(state.lastWeatherCheck).toBe(20);
  });
});
