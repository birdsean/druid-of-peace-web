import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadLocationData } from '../lib/locationLoader';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('locationLoader', () => {
  it('loadLocationData parses response', async () => {
    const data = [
      {
        id: 'loc1',
        name: 'Place',
        heat: 10,
        hasEncounter: false,
        position: { x: 0, y: 0 },
        icon: 'i',
        description: 'desc'
      }
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(data)
    } as any);
    const result = await loadLocationData();
    expect(global.fetch).toHaveBeenCalledWith('/data/locations/forest-zones.json');
    expect(result).toEqual(data);
  });

  it('loadLocationData returns empty array on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as any);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await loadLocationData();
    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });
});
