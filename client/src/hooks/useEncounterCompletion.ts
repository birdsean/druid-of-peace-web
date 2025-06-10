import { useCallback } from "react";
import { getGlobalMapState } from "@/lib/mapState";

export function useEncounterCompletion() {
  return useCallback((success: boolean) => {
    const mapState = getGlobalMapState();
    if (mapState.resolveEncounter && mapState.currentEncounterZone) {
      mapState.resolveEncounter(mapState.currentEncounterZone, success);
    }
  }, []);
}
