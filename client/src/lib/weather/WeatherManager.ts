import { WeatherData, WeatherState, WeatherEffect, ActiveWeather } from './types';

class WeatherManager {
  private weatherData: WeatherData | null = null;
  private weatherState: WeatherState = {
    activeWeather: null,
    lastWeatherCheck: 0,
    weatherHistory: []
  };
  private listeners: Array<(state: WeatherState) => void> = [];

  async loadWeatherData(): Promise<WeatherData | null> {
    try {
      const response = await fetch('/data/weather/weather-effects.json');
      if (!response.ok) {
        console.error('Failed to load weather data:', response.statusText);
        return null;
      }
      this.weatherData = await response.json();
      return this.weatherData;
    } catch (error) {
      console.error('Error loading weather data:', error);
      return null;
    }
  }

  getWeatherData(): WeatherData | null {
    return this.weatherData;
  }

  getWeatherState(): WeatherState {
    return { ...this.weatherState };
  }

  checkForWeatherTrigger(currentTurn: number): boolean {
    // Weather triggers every 16-32 turns when no weather is active
    const turnsSinceLastCheck = currentTurn - this.weatherState.lastWeatherCheck;
    const minTurns = 16;
    const maxTurns = 32;

    if (this.weatherState.activeWeather) {
      // Weather is active, check for expiration
      this.weatherState.activeWeather.remainingTurns--;

      if (this.weatherState.activeWeather.remainingTurns <= 0) {
        // Weather expires
        this.weatherState.weatherHistory.push({
          weatherId: this.weatherState.activeWeather.effect.id,
          startTurn: this.weatherState.activeWeather.startTurn,
          endTurn: currentTurn
        });
        this.weatherState.activeWeather = null;
        this.weatherState.lastWeatherCheck = currentTurn;
        this.notifyListeners();
        return true; // Weather changed (ended)
      }
      // Weather is still active but turn counter changed, notify listeners
      this.notifyListeners();
      return false;
    }

    // No active weather, check if enough turns have passed
    if (turnsSinceLastCheck >= minTurns) {
      const triggerChance = Math.min(
        0.3,
        ((turnsSinceLastCheck - minTurns) / (maxTurns - minTurns)) * 0.3
      );
      const roll = Math.random();

      if (roll < triggerChance) {
        this.triggerRandomWeather(currentTurn);
        return true; // Weather changed (started)
      }
    }

    return false;
  }

  triggerRandomWeather(currentTurn: number): void {
    if (!this.weatherData) return;

    const weatherEffects = Object.values(this.weatherData.weatherEffects);
    if (weatherEffects.length === 0) return;

    // Weighted random selection based on trigger chance
    const totalWeight = weatherEffects.reduce(
      (sum, effect) => sum + effect.trigger_chance,
      0
    );
    let random = Math.random() * totalWeight;

    let selectedEffect: WeatherEffect | null = null;
    for (const effect of weatherEffects) {
      random -= effect.trigger_chance;
      if (random <= 0) {
        selectedEffect = effect;
        break;
      }
    }

    if (!selectedEffect) {
      selectedEffect =
        weatherEffects[Math.floor(Math.random() * weatherEffects.length)];
    }

    const duration =
      Math.floor(
        Math.random() *
          (selectedEffect.max_duration - selectedEffect.min_duration + 1)
      ) + selectedEffect.min_duration;

    this.weatherState.activeWeather = {
      effect: selectedEffect,
      remainingTurns: duration,
      startTurn: currentTurn
    };

    this.weatherState.lastWeatherCheck = currentTurn;
    this.notifyListeners();
  }

  triggerSpecificWeather(weatherId: string, currentTurn: number): boolean {
    if (!this.weatherData || !this.weatherData.weatherEffects[weatherId]) {
      return false;
    }

    const effect = this.weatherData.weatherEffects[weatherId];
    const duration =
      Math.floor(Math.random() * (effect.max_duration - effect.min_duration + 1)) +
      effect.min_duration;

    // End current weather if active
    if (this.weatherState.activeWeather) {
      this.weatherState.weatherHistory.push({
        weatherId: this.weatherState.activeWeather.effect.id,
        startTurn: this.weatherState.activeWeather.startTurn,
        endTurn: currentTurn
      });
    }

    this.weatherState.activeWeather = {
      effect,
      remainingTurns: duration,
      startTurn: currentTurn
    };

    this.weatherState.lastWeatherCheck = currentTurn;
    this.notifyListeners();
    return true;
  }

  clearWeather(currentTurn: number): void {
    if (this.weatherState.activeWeather) {
      this.weatherState.weatherHistory.push({
        weatherId: this.weatherState.activeWeather.effect.id,
        startTurn: this.weatherState.activeWeather.startTurn,
        endTurn: currentTurn
      });
      this.weatherState.activeWeather = null;
      this.notifyListeners();
    }
  }

  getActiveEnvironmentalEffect(): string | null {
    return this.weatherState.activeWeather?.effect.environmental_effect || null;
  }

  subscribe(listener: (state: WeatherState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getWeatherState()));
  }

  // Debug methods
  debugTriggerWeather(weatherId: string, currentTurn: number = 1): boolean {
    return this.triggerSpecificWeather(weatherId, currentTurn);
  }

  debugClearWeather(currentTurn: number = 1): void {
    this.clearWeather(currentTurn);
  }

  debugGetWeatherHistory(): Array<{
    weatherId: string;
    startTurn: number;
    endTurn: number;
  }> {
    return [...this.weatherState.weatherHistory];
  }
}

export const globalWeatherManager = new WeatherManager();

export { WeatherManager };

