import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadEnvironmentalEffects } from '../lib/environmentLoader';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('environmentLoader', () => {
  it('loadEnvironmentalEffects parses response', async () => {
    const data = {
      environmentalEffects: {
        fog: {
          id: 'fog',
          name: 'Fog',
          description: 'low visibility',
          icon: 'f',
          effects: {
            druidAdvantage: { stealthBonus: 5 },
            npcEffects: {}
          },
          color: '#fff'
        }
      }
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(data)
    } as any);

    const result = await loadEnvironmentalEffects();
    expect(global.fetch).toHaveBeenCalledWith('/data/environments/effects.json');
    expect(result).toEqual(data);
  });

  it('loadEnvironmentalEffects returns null on error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await loadEnvironmentalEffects();
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });
});
