// Global map state for sharing between components
let globalMapState: {
  resolveEncounter?: (zoneId: string, success: boolean) => void;
  currentEncounterZone?: string;
} = {};

export function setGlobalMapState(state: { 
  resolveEncounter: (zoneId: string, success: boolean) => void;
  currentEncounterZone?: string;
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