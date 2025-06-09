import { useState, useCallback } from 'react';
import { MapEvent, createMapEvent, formatMapEventForLog } from '@/lib/events';

export function useMapEvents() {
  const [mapEvents, setMapEvents] = useState<MapEvent[]>([]);

  const addMapEvent = useCallback((event: MapEvent) => {
    setMapEvents(prev => [...prev, event]);
  }, []);

  const logTurnAdvance = useCallback((turn: number) => {
    const event = createMapEvent(turn, 'turn_advance');
    addMapEvent(event);
  }, [addMapEvent]);

  const logEncounterStart = useCallback((turn: number, zoneId: string, zoneName: string) => {
    const event = createMapEvent(turn, 'encounter_start', { zoneId, zoneName });
    addMapEvent(event);
  }, [addMapEvent]);

  const logEncounterComplete = useCallback((turn: number, zoneId: string, zoneName: string, success: boolean) => {
    const event = createMapEvent(turn, 'encounter_complete', { zoneId, zoneName, success });
    addMapEvent(event);
  }, [addMapEvent]);

  const logZoneChange = useCallback((turn: number, zoneId: string, zoneName: string) => {
    const event = createMapEvent(turn, 'zone_change', { zoneId, zoneName });
    addMapEvent(event);
  }, [addMapEvent]);

  const getEventLog = useCallback(() => {
    return mapEvents.map(event => formatMapEventForLog(event));
  }, [mapEvents]);

  return {
    mapEvents,
    addMapEvent,
    logTurnAdvance,
    logEncounterStart,
    logEncounterComplete,
    logZoneChange,
    getEventLog
  };
}