import { describe, it, expect, afterEach, vi } from 'vitest';
import { loadNPCActions, getActionById, selectNPCAction, type NPCActionsData } from '../lib/actionLoader';

const originalFetch = global.fetch;

const actionsData: NPCActionsData = {
  npcActions: {
    attack: {
      id: 'attack',
      name: 'Attack',
      description: '',
      icon: 'A',
      animation: 'attack',
      effects: {},
      requirements: { minWillToFight: 30 },
      weight: 60
    },
    defend: {
      id: 'defend',
      name: 'Defend',
      description: '',
      icon: 'D',
      animation: 'defend',
      effects: {},
      requirements: { maxWillToFight: 70 },
      weight: 30
    },
    investigate: {
      id: 'investigate',
      name: 'Investigate',
      description: '',
      icon: 'I',
      animation: 'hit',
      effects: {},
      requirements: { minAwareness: 20 },
      weight: 40
    }
  }
};

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('actionLoader', () => {
  it('loadNPCActions parses response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(actionsData)
    } as any);

    const result = await loadNPCActions();
    expect(global.fetch).toHaveBeenCalledWith('/data/characters/actions.json');
    expect(result).toEqual(actionsData);
    expect(result?.npcActions.attack.animation).toBe('attack');
  });

  it('loadNPCActions returns null on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as any);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await loadNPCActions();
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('getActionById returns action when found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(actionsData)
    } as any);

    const result = await getActionById('defend');
    expect(result).toEqual(actionsData.npcActions.defend);
    expect(result?.animation).toBe('defend');
  });

  it('getActionById returns undefined when not found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(actionsData)
    } as any);

    const result = await getActionById('missing');
    expect(result).toBeUndefined();
  });

  it('selectNPCAction filters and chooses weighted action', () => {
    const actionsConfig = actionsData.npcActions;
    const available = ['attack', 'defend', 'investigate'];
    const npcStats = { willToFight: 50, awareness: 10 };

    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy.mockReturnValueOnce(0); // choose attack
    randomSpy.mockReturnValueOnce(0.8); // choose defend

    const first = selectNPCAction(available, npcStats, actionsConfig);
    const second = selectNPCAction(available, npcStats, actionsConfig);

    expect(first).toBe('attack');
    expect(second).toBe('defend');

    randomSpy.mockRestore();
  });

  it('selectNPCAction returns first action if none valid', () => {
    const actionsConfig = actionsData.npcActions;
    const result = selectNPCAction(['investigate'], { willToFight: 40, awareness: 10 }, actionsConfig);
    expect(result).toBe('investigate');
  });
});
