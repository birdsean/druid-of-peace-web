import { describe, it, expect } from 'vitest';
import { formatBattleEventForLog, formatMapEventForLog } from '../lib/events';
import type { BattleEvent, MapEvent } from '../lib/events';


describe('formatBattleEventForLog', () => {
  it('formats game_start events', () => {
    const event: BattleEvent = {
      id: '1',
      timestamp: 0,
      turn: 1,
      type: 'game_start',
      actor: 'druid'
    };
    expect(formatBattleEventForLog(event)).toBe('Combat begins');
  });

  it('formats npc_action events', () => {
    const event: BattleEvent = {
      id: '2',
      timestamp: 0,
      turn: 2,
      type: 'npc_action',
      actor: 'npc1',
      action: 'slashes',
      result: 'hit'
    };
    expect(formatBattleEventForLog(event)).toBe('Gareth slashes (hit)');
  });

  it('formats druid_action events', () => {
    const event: BattleEvent = {
      id: '3',
      timestamp: 0,
      turn: 3,
      type: 'druid_action',
      actor: 'druid',
      action: 'peace_aura',
      target: 'npc2',
      effect: 'calmed'
    };
    expect(formatBattleEventForLog(event)).toBe('Druid peace_aura on Lyra (calmed)');
  });

  it('formats item_use events', () => {
    const event: BattleEvent = {
      id: '4',
      timestamp: 0,
      turn: 4,
      type: 'item_use',
      actor: 'druid',
      itemName: 'Potion',
      effect: 'heals 10'
    };
    expect(formatBattleEventForLog(event)).toBe('Used Potion: heals 10');
  });

  it('formats turn_advance events', () => {
    const event: BattleEvent = {
      id: '5',
      timestamp: 0,
      turn: 5,
      type: 'turn_advance',
      actor: 'npc1'
    };
    expect(formatBattleEventForLog(event)).toBe('Turn 5');
  });

  it('formats game_end events', () => {
    const event: BattleEvent = {
      id: '6',
      timestamp: 0,
      turn: 6,
      type: 'game_end',
      actor: 'druid',
      result: 'Victory'
    };
    expect(formatBattleEventForLog(event)).toBe('Victory');
  });
});

describe('formatMapEventForLog', () => {
  it('formats turn_advance events', () => {
    const event: MapEvent = {
      id: '7',
      timestamp: 0,
      turn: 7,
      type: 'turn_advance'
    };
    expect(formatMapEventForLog(event)).toBe('Turn 7');
  });

  it('formats encounter_start events', () => {
    const event: MapEvent = {
      id: '8',
      timestamp: 0,
      turn: 8,
      type: 'encounter_start',
      zoneId: 'zone1',
      zoneName: 'Forest'
    };
    expect(formatMapEventForLog(event)).toBe('Encounter started in Forest');
  });

  it('formats encounter_complete events for success', () => {
    const event: MapEvent = {
      id: '9',
      timestamp: 0,
      turn: 9,
      type: 'encounter_complete',
      zoneId: 'zone2',
      zoneName: 'Cave',
      success: true
    };
    expect(formatMapEventForLog(event)).toBe('Encounter successful in Cave');
  });

  it('formats encounter_generated events', () => {
    const event: MapEvent = {
      id: '12',
      timestamp: 0,
      turn: 12,
      type: 'encounter_generated',
      zoneId: 'zone4',
      zoneName: 'Valley'
    };
    expect(formatMapEventForLog(event)).toBe('Encounter spawned in Valley');
  });

  it('formats zone_change events', () => {
    const event: MapEvent = {
      id: '10',
      timestamp: 0,
      turn: 10,
      type: 'zone_change',
      zoneId: 'zone3',
      zoneName: 'Town'
    };
    expect(formatMapEventForLog(event)).toBe('Moved to Town');
  });

  it('formats travel events', () => {
    const event: MapEvent = {
      id: '11',
      timestamp: 0,
      turn: 11,
      type: 'travel',
      details: 'Travelling'
    };
    expect(formatMapEventForLog(event)).toBe('Travelling');
  });

  it('formats weather_change events', () => {
    const event: MapEvent = {
      id: '13',
      timestamp: 0,
      turn: 13,
      type: 'weather_change',
      details: 'Weather: Rain'
    };
    expect(formatMapEventForLog(event)).toBe('Weather: Rain');
  });
});
