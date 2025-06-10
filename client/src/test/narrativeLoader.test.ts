import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadNarrativeScript } from '../lib/narrativeLoader';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('narrativeLoader', () => {
  it('loadNarrativeScript parses response', async () => {
    const script = {
      id: 'intro',
      title: 'Intro',
      startPage: 'p1',
      pages: []
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(script)
    } as any);
    const result = await loadNarrativeScript('intro');
    expect(global.fetch).toHaveBeenCalledWith('/data/narratives/intro.json');
    expect(result).toEqual(script);
  });

  it('loadNarrativeScript returns null on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as any);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await loadNarrativeScript('intro');
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });
});
