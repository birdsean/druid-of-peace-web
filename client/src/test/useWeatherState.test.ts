import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWeatherState, globalWeatherManager } from '../lib/weatherSystem';
import type { WeatherState } from '../lib/weatherSystem';

describe('useWeatherState', () => {
  const initialState: WeatherState = {
    activeWeather: null,
    lastWeatherCheck: 10,
    weatherHistory: []
  };
  let unsubscribeMock: any;

  beforeEach(() => {
    unsubscribeMock = vi.fn();
    vi.spyOn(globalWeatherManager, 'getWeatherState').mockReturnValue(initialState);
    vi.spyOn(globalWeatherManager, 'subscribe').mockReturnValue(unsubscribeMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state and unsubscribes on unmount', () => {
    const { result, unmount } = renderHook(() => useWeatherState());

    expect(result.current).toEqual(initialState);
    expect(globalWeatherManager.subscribe).toHaveBeenCalledTimes(1);

    unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
