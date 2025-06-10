import { describe, it, expect, beforeEach, vi } from 'vitest';

let subscribeMock: any;

beforeEach(() => {
  vi.resetModules();
  subscribeMock = vi.fn();
  vi.doMock('../lib/historySystem', () => ({
    globalHistoryManager: {
      subscribe: subscribeMock,
    },
  }));
});

describe('globalSkillNotifications', () => {
  it('updates pending notifications on history changes', async () => {
  const mod = await import('../lib/globalSkillNotifications');
  const { getPendingNotifications, clearPendingNotifications, subscribeToSkillNotifications } = mod;

  clearPendingNotifications();
  const historyCallback = subscribeMock.mock.calls[0][0];

  const listener = vi.fn();
  subscribeToSkillNotifications(listener);

  historyCallback({ pendingSkills: ['wind_whisperer'] });

  expect(getPendingNotifications()).toEqual(['wind_whisperer']);
  expect(listener).toHaveBeenCalledWith(['wind_whisperer']);
});

it('allows subscribers to unsubscribe', async () => {
  const mod = await import('../lib/globalSkillNotifications');
  const { getPendingNotifications, clearPendingNotifications, subscribeToSkillNotifications } = mod;

  clearPendingNotifications();
  const historyCallback = subscribeMock.mock.calls[0][0];

  const listener = vi.fn();
  const unsubscribe = subscribeToSkillNotifications(listener);
  unsubscribe();

  historyCallback({ pendingSkills: ['earth_shaper'] });

  expect(getPendingNotifications()).toEqual(['earth_shaper']);
  expect(listener).not.toHaveBeenCalled();
});

});
