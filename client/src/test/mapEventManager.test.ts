import { describe, it, expect, beforeEach } from 'vitest';
import { MapEventManager } from '../lib/MapEventManager';
import { createMapEvent } from '../lib/events';

describe('MapEventManager', () => {
  let manager: MapEventManager;
  beforeEach(() => {
    manager = new MapEventManager();
  });

  it('stores and notifies events', () => {
    const events: any[] = [];
    manager.subscribe(e => events.push(...e));
    const ev = createMapEvent(1, 'turn_advance');
    manager.addEvent(ev);
    expect(events[events.length - 1]).toEqual(ev);
    expect(manager.getEvents()).toHaveLength(1);
  });
});
