export interface WeatherEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  season: string;
  effects: string[];
  min_duration: number;
  max_duration: number;
  trigger_chance: number;
  environmental_effect: string;
}

export interface WeatherData {
  weatherEffects: Record<string, WeatherEffect>;
}

export interface ActiveWeather {
  effect: WeatherEffect;
  remainingTurns: number;
  startTurn: number;
}

export interface WeatherState {
  activeWeather: ActiveWeather | null;
  lastWeatherCheck: number;
  weatherHistory: Array<{
    weatherId: string;
    startTurn: number;
    endTurn: number;
  }>;
}
