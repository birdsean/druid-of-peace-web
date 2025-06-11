// Battle Event System
export interface BattleEvent {
  id: string;
  timestamp: number;
  turn: number;
  type: 'npc_action' | 'druid_action' | 'item_use' | 'game_start' | 'game_end' | 'turn_advance';
  actor: 'npc1' | 'npc2' | 'druid';
  action?: string;
  target?: 'npc1' | 'npc2' | 'druid';
  result?: string;
  damage?: number;
  effect?: string;
  itemName?: string;
}

// Map Event System
export interface MapEvent {
  id: string;
  timestamp: number;
  turn: number;
  type:
    | 'turn_advance'
    | 'encounter_start'
    | 'encounter_complete'
    | 'encounter_generated'
    | 'zone_change'
    | 'travel'
    | 'weather_change';
  zoneId?: string;
  zoneName?: string;
  success?: boolean;
  details?: string;
}

export function createBattleEvent(
  turn: number,
  type: BattleEvent['type'],
  actor: BattleEvent['actor'],
  options: Partial<BattleEvent> = {}
): BattleEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    turn,
    type,
    actor,
    ...options
  };
}

export function createMapEvent(
  turn: number,
  type: MapEvent['type'],
  options: Partial<MapEvent> = {}
): MapEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    turn,
    type,
    ...options
  };
}

export function formatBattleEventForLog(event: BattleEvent): string {
  switch (event.type) {
    case 'game_start':
      return 'Combat begins';
    case 'npc_action':
      return `${event.actor === 'npc1' ? 'Gareth' : 'Lyra'} ${event.action}${event.result ? ` (${event.result})` : ''}`;
    case 'druid_action':
      return `Druid ${event.action}${event.target ? ` on ${event.target === 'npc1' ? 'Gareth' : 'Lyra'}` : ''}${event.effect ? ` (${event.effect})` : ''}`;
    case 'item_use':
      return `Used ${event.itemName}: ${event.effect}`;
    case 'turn_advance':
      return `Turn ${event.turn}`;
    case 'game_end':
      return event.result || 'Combat ends';
    default:
      return event.action || 'Unknown action';
  }
}

export function formatMapEventForLog(event: MapEvent): string {
  switch (event.type) {
    case 'turn_advance':
      return `Turn ${event.turn}`;
    case 'encounter_start':
      return `Encounter started in ${event.zoneName}`;
    case 'encounter_complete':
      return `Encounter ${event.success ? 'successful' : 'failed'} in ${event.zoneName}`;
    case 'encounter_generated':
      return `Encounter spawned in ${event.zoneName}`;
    case 'zone_change':
      return `Moved to ${event.zoneName}`;
    case 'travel':
      return event.details || 'Travel action';
    case 'weather_change':
      return event.details || 'Weather changed';
    default:
      return event.details || 'Unknown event';
  }
}