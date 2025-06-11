import { useState, useCallback, useEffect } from 'react';
import { MapEvent, createMapEvent, formatMapEventForLog } from '@/lib/events';
import { globalMapEventManager } from '@/lib/MapEventManager';

export function useMapEvents() {
  const [mapEvents, setMapEvents] = useState<MapEvent[]>(() => globalMapEventManager.getEvents());

  useEffect(() => {
    const unsubscribe = globalMapEventManager.subscribe(setMapEvents);
    return unsubscribe;
  }, []);

  const addMapEvent = useCallback((event: MapEvent) => {
    globalMapEventManager.addEvent(event);
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

  const logEncounterGenerated = useCallback((turn: number, zoneId: string, zoneName: string) => {
    const event = createMapEvent(turn, 'encounter_generated', { zoneId, zoneName });
    addMapEvent(event);
  }, [addMapEvent]);

  const logZoneChange = useCallback((turn: number, zoneId: string, zoneName: string) => {
    const event = createMapEvent(turn, 'zone_change', { zoneId, zoneName });
    addMapEvent(event);
  }, [addMapEvent]);

  const logWeatherChange = useCallback((turn: number, details: string) => {
    const event = createMapEvent(turn, 'weather_change', { details });
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
    logEncounterGenerated,
    logZoneChange,
    logWeatherChange,
    getEventLog
  };
}