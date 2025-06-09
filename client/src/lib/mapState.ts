// Global map state for sharing between components
let globalMapState: {
  resolveEncounter?: (zoneId: string, success: boolean) => void;
} = {};

export function setGlobalMapState(state: { resolveEncounter: (zoneId: string, success: boolean) => void }) {
  globalMapState = state;
}

export function getGlobalMapState() {
  return globalMapState;
}