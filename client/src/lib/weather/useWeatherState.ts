import React from 'react';
import { globalWeatherManager } from './WeatherManager';
import type { WeatherState } from './types';

export function useWeatherState() {
  const [weatherState, setWeatherState] = React.useState<WeatherState>(
    globalWeatherManager.getWeatherState()
  );

  React.useEffect(() => {
    const unsubscribe = globalWeatherManager.subscribe(setWeatherState);
    return unsubscribe;
  }, []);

  return weatherState;
}

