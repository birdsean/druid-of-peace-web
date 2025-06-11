// Global map state for sharing between components
let globalMapState: {
  resolveEncounter?: (zoneId: string, success: boolean) => void;
  currentEncounterZone?: string;
  activeWeatherEffect?: string | null;
} = {};

export function setGlobalMapState(state: {
  resolveEncounter: (zoneId: string, success: boolean) => void;
  currentEncounterZone?: string;
  activeWeatherEffect?: string | null;
}) {
  globalMapState = state;
}

export function getGlobalMapState() {
  return globalMapState;
}

export function setCurrentEncounterZone(zoneId: string) {
  globalMapState.currentEncounterZone = zoneId;
}

export function getCurrentEncounterZone(): string | undefined {
  return globalMapState.currentEncounterZone;
}

export function setActiveWeatherEffect(effect: string | null) {
  globalMapState.activeWeatherEffect = effect;
}

export function getActiveWeatherEffect(): string | null | undefined {
  return globalMapState.activeWeatherEffect;
}