import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadNPCData, loadPCData } from '../lib/characterLoader';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('characterLoader', () => {
  it('loadNPCData parses response', async () => {
    const npc = {
      id: 'npc1',
      name: 'Goblin',
      icon: 'g',
      color: 'green',
      position: 'right' as const,
      stats: {
        health: 5,
        maxHealth: 5,
        armor: 0,
        maxArmor: 0,
        willToFight: 3,
        maxWill: 3,
        awareness: 1,
        maxAwareness: 2
      }
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([npc])
    } as any);

    const result = await loadNPCData();
    expect(global.fetch).toHaveBeenCalledWith('/data/characters/npcs.json');
    expect(result).toEqual([
      {
        ...npc,
        description: `NPC character: ${npc.name}`,
        actions: ['attack', 'defend']
      }
    ]);
  });

  it('loadNPCData returns empty array on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as any);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await loadNPCData();
    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('loadPCData parses response', async () => {
    const pc = {
      id: 'pc',
      name: 'Hero',
      icon: 'h',
      color: 'blue',
      stats: { hidden: false, actionPoints: 1, maxActionPoints: 1 },
      abilities: []
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(pc)
    } as any);
    const result = await loadPCData();
    expect(global.fetch).toHaveBeenCalledWith('/data/characters/pc.json');
    expect(result).toEqual(pc);
  });

  it('loadPCData returns null on error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await loadPCData();
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });
});
