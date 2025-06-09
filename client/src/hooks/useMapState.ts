import { useState, useCallback, useEffect } from "react";
import { loadLocationData } from "../lib/locationLoader";

export interface Zone {
  id: string;
  name: string;
  heat: number;
  hasEncounter: boolean;
  position: { x: number; y: number };
  icon: string;
  description: string;
}

interface MapState {
  zones: Zone[];
  currentZone: string;
  turnCounter: number;
  activeEncounterZone: string | null;
}

const initialZones: Zone[] = [
  // Top row
  {
    id: "grove",
    name: "Sacred Grove",
    heat: 25,
    hasEncounter: false,
    position: { x: 20, y: 35 },
    icon: "🌳"
  },
  {
    id: "lake",
    name: "Moonlit Lake",
    heat: 15,
    hasEncounter: false,
    position: { x: 50, y: 35 },
    icon: "🌊"
  },
  {
    id: "thicket",
    name: "Deep Thicket",
    heat: 45,
    hasEncounter: true,
    position: { x: 80, y: 35 },
    icon: "🌿"
  },
  // Bottom row
  {
    id: "clearing",
    name: "Sunlit Clearing",
    heat: 8,
    hasEncounter: false,
    position: { x: 20, y: 65 },
    icon: "☀️"
  },
  {
    id: "ruins",
    name: "Ancient Ruins",
    heat: 75,
    hasEncounter: false,
    position: { x: 50, y: 65 },
    icon: "🏛️"
  },
  {
    id: "cavern",
    name: "Hidden Cavern",
    heat: 90,
    hasEncounter: true,
    position: { x: 80, y: 65 },
    icon: "🕳️"
  }
];

const initialMapState: MapState = {
  zones: initialZones,
  currentZone: "grove",
  turnCounter: 1,
  activeEncounterZone: null
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

  const setCurrentZone = useCallback((zoneId: string) => {
    setMapState(prev => ({
      ...prev,
      currentZone: zoneId
    }));
  }, []);

  const startEncounter = useCallback((zoneId: string) => {
    setMapState(prev => ({
      ...prev,
      activeEncounterZone: zoneId
    }));
  }, []);

  const resolveEncounter = useCallback((zoneId: string, success: boolean) => {
    const zone = mapState.zones.find(z => z.id === zoneId);
    const zoneName = zone?.name || zoneId;
    const heatChange = success ? -15 : 10;
    
    console.log(`Encounter resolved in zone ${zoneId} (${zoneName}) - Success: ${success}, Heat change: ${heatChange}`);
    
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
    setMapState(prev => {
      const newZones = prev.zones.map(zone => {
        // Skip if zone already has encounter
        if (zone.hasEncounter) return zone;

        // Roll for encounter
        const roll = rollDice(1, 100);
        const encounterChance = calculateEncounterChance(zone.heat);
        const hasNewEncounter = roll <= encounterChance;

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

        // Apply encounter bonus heat if encounter generated
        if (hasNewEncounter) {
          heatChange += rollDice(2, 4);
          console.log(`New encounter created in zone ${zone.id} (${zone.name}) - Heat: ${zone.heat}, Roll: ${roll}, Chance: ${encounterChance}%`);
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
        turnCounter: prev.turnCounter + 1
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
    setCurrentZone,
    startEncounter,
    resolveEncounter,
    nextTurn,
    getHeatLevel,
    getHeatColor,
    getEncounterResolution
  };
}