import { useState, useCallback, useEffect } from "react";
import { loadLocationData } from "../lib/locationLoader";
import { loadMapActions, type MapAction } from "@/lib/mapActionLoader";
import { globalTimeManager, type TimePhase, applyPhaseColorPalette } from "@/lib/timeSystem";
import { globalMapEventManager } from "@/lib/MapEventManager";
import { createMapEvent } from "@/lib/events";

export interface Zone {
  id: string;
  name: string;
  heat: number;
  hasEncounter: boolean;
  position: { x: number; y: number };
  icon: string;
  description: string;
  environmentEffect?: string;
}

interface MapState {
  zones: Zone[];
  currentZone: string;
  turnCounter: number;
  activeEncounterZone: string | null;
  activeWeatherEffect: string | null;
  currentTimePhase: TimePhase;
  actionPoints: number;
  maxActionPoints: number;
  mapActions: MapAction[];
}

const defaultZones: Zone[] = [];

const initialMapState: MapState = {
  zones: defaultZones,
  currentZone: "grove",
  turnCounter: 1,
  activeEncounterZone: null,
  activeWeatherEffect: null,
  currentTimePhase: 'day1' as TimePhase,
  actionPoints: 1,
  maxActionPoints: 1
  mapActions: []
};

function rollDice(min = 1, max = 6): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateEncounterChance(heat: number): number {
  if (heat <= 10) return 5;
  if (heat <= 30) return 10;
  if (heat <= 50) return 20;
  if (heat <= 70) return 35;
  if (heat <= 90) return 50;
  return 70; // Critical heat
}

export function useMapState() {
  const [mapState, setMapState] = useState<MapState>(initialMapState);

  // Load location data on initialization
  useEffect(() => {
    const loadZones = async () => {
      try {
        const locations = await loadLocationData();
        setMapState(prev => ({
          ...prev,
          zones: locations
        }));
      } catch (error) {
        console.error('Failed to load location data:', error);
      }
    };
    loadZones();
  }, []);

  // Load map actions on initialization
  useEffect(() => {
    const loadActions = async () => {
      try {
        const actions = await loadMapActions();
        setMapState(prev => ({
          ...prev,
          mapActions: actions
        }));
      } catch (error) {
        console.error('Failed to load map actions:', error);
      }
    };
    loadActions();
  }, []);

  // Initialize time system and sync with map state
  useEffect(() => {
    const timeState = globalTimeManager.getState();
    setMapState(prev => ({
      ...prev,
      currentTimePhase: timeState.currentPhase,
      turnCounter: timeState.turnCounter
    }));

    // Apply initial color palette
    applyPhaseColorPalette(timeState.currentPhase);

    // Subscribe to time changes
    const unsubscribe = globalTimeManager.subscribe((timeState) => {
      setMapState(prev => ({
        ...prev,
        currentTimePhase: timeState.currentPhase,
        turnCounter: timeState.turnCounter
      }));
      applyPhaseColorPalette(timeState.currentPhase);
    });

    return unsubscribe;
  }, []);

  const setCurrentZone = useCallback((zoneId: string) => {
    setMapState(prev => ({
      ...prev,
      currentZone: zoneId
    }));
  }, []);

  const spendActionPoint = useCallback((amount: number = 1) => {
    setMapState(prev => ({
      ...prev,
      actionPoints: Math.max(0, prev.actionPoints - amount)
    }));
  }, []);

  const restoreActionPoints = useCallback((amount: number = 1) => {
    setMapState(prev => ({
      ...prev,
      actionPoints: Math.min(prev.maxActionPoints, prev.actionPoints + amount)
    }));
  }, []);

  const startEncounter = useCallback((zoneId: string, weatherEffect: string | null) => {
    setMapState(prev => ({
      ...prev,
      activeEncounterZone: zoneId,
      activeWeatherEffect: weatherEffect
    }));
  }, []);

  const resolveEncounter = useCallback((zoneId: string, success: boolean) => {
    const zone = mapState.zones.find(z => z.id === zoneId);
    const zoneName = zone?.name || zoneId;
    const heatChange = success ? -15 : 10;
    const event = createMapEvent(mapState.turnCounter, 'encounter_complete', {
      zoneId,
      zoneName,
      success
    });
    globalMapEventManager.addEvent(event);
    
    setMapState(prev => ({
      ...prev,
      zones: prev.zones.map(zone => {
        if (zone.id === zoneId) {
          return {
            ...zone,
            heat: Math.max(0, Math.min(100, zone.heat + heatChange)),
            hasEncounter: false
          };
        }
        return zone;
      }),
      activeEncounterZone: null
    }));
  }, [mapState.zones]);

  // Global state for encounter resolution
  const getEncounterResolution = useCallback(() => {
    return { resolveEncounter };
  }, [resolveEncounter]);

  const nextTurn = useCallback(() => {
    // Advance time phase first
    globalTimeManager.advancePhase();

    setMapState(prev => {
      const newZones = prev.zones.map(zone => {
        // Determine if we should roll for a new encounter
        const shouldRollEncounter = !zone.hasEncounter;

        let hasNewEncounter = zone.hasEncounter;
        let roll = 0;
        let encounterChance = 0;
        if (shouldRollEncounter) {
          roll = rollDice(1, 100);
          encounterChance = calculateEncounterChance(zone.heat);
          hasNewEncounter = roll <= encounterChance;
        }

        // Heat jitter calculation with weighted randomness
        let heatChange = 0;
        if (zone.heat === 0) {
          // 5% chance to reignite to 1 when heat is zero
          if (rollDice(1, 100) <= 5) {
            heatChange = 1;
          }
        } else {
          // Dynamic heat changes based on current heat level
          const jitterRoll = rollDice(1, 20);
          
          if (jitterRoll <= 2) {
            // 10% chance to decrease heat (peaceful influence spreads)
            heatChange = rollDice(1, 3) * -1;
          } else if (jitterRoll <= 5) {
            // 15% chance for no change (stability)
            heatChange = 0;
          } else if (jitterRoll <= 12) {
            // 35% chance for small increase (natural tension buildup)
            heatChange = rollDice(1, 2);
          } else if (jitterRoll <= 17) {
            // 25% chance for moderate increase
            heatChange = rollDice(2, 4);
          } else {
            // 15% chance for larger increase (conflicts spread)
            heatChange = rollDice(3, 6);
          }
          
          // Modifier based on current heat level
          if (zone.heat > 70) {
            // High heat zones are more volatile
            heatChange += rollDice(1, 2);
          } else if (zone.heat < 20) {
            // Low heat zones are more stable
            heatChange = Math.max(-1, heatChange - 1);
          }
        }

        // Apply encounter bonus heat if a new encounter was generated
        if (shouldRollEncounter && hasNewEncounter) {
          heatChange += rollDice(2, 4);
          const event = createMapEvent(prev.turnCounter + 1, 'encounter_generated', {
            zoneId: zone.id,
            zoneName: zone.name
          });

          globalMapEventManager.addEvent(event);
        }

        const newHeat = Math.max(0, Math.min(100, zone.heat + heatChange));

          return {
            ...zone,
            heat: newHeat,
            hasEncounter: hasNewEncounter
          };
      });

      return {
        ...prev,
        zones: newZones,
        actionPoints: prev.maxActionPoints
      };
    });
  }, []);

  const getHeatLevel = useCallback((heat: number): string => {
    if (heat <= 10) return "None";
    if (heat <= 30) return "Cold";
    if (heat <= 50) return "Cool";
    if (heat <= 70) return "Warm";
    if (heat <= 90) return "Hot";
    return "Critical";
  }, []);

  const getHeatColor = useCallback((heat: number): string => {
    if (heat <= 10) return "bg-blue-500";
    if (heat <= 30) return "bg-cyan-500";
    if (heat <= 50) return "bg-green-500";
    if (heat <= 70) return "bg-yellow-500";
    if (heat <= 90) return "bg-orange-500";
    return "bg-red-500";
  }, []);

  return {
    zones: mapState.zones,
    currentZone: mapState.currentZone,
    turnCounter: mapState.turnCounter,
    activeEncounterZone: mapState.activeEncounterZone,
    activeWeatherEffect: mapState.activeWeatherEffect,
    currentTimePhase: mapState.currentTimePhase,
    actionPoints: mapState.actionPoints,
    maxActionPoints: mapState.maxActionPoints,
    mapActions: mapState.mapActions,
    setCurrentZone,
    spendActionPoint,
    restoreActionPoints,
    startEncounter,
    resolveEncounter,
    nextTurn,
    getHeatLevel,
    getHeatColor,
    getEncounterResolution
  };
}
