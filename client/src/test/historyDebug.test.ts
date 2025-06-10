import { describe, it, expect, vi } from 'vitest';
import { HistoryManager } from '../lib/historySystem';
import { debugReset, debugUnlockSkill } from '../lib/historyDebug';

// Unit tests for the debug helper functions

describe('historyDebug helpers', () => {
  it('debugReset clears history state', () => {
    const manager = new HistoryManager();
    manager.startEncounter('zone1', 'Test Zone', 1, [], undefined, 'dawn');
    manager.addPlayerAction({ type: 'peace_aura', roll: 4, target: 'npc1' });
    manager.completeEncounter('success');

    expect(manager.getHistory().totalEncounters).toBe(1);

    debugReset(manager);

    const history = manager.getHistory();
    expect(history.totalEncounters).toBe(0);
    expect(history.encounters).toHaveLength(0);
    expect(history.pendingSkills).toHaveLength(0);
    expect(manager.getCurrentEncounter()).toBeNull();
  });

  it('debugUnlockSkill adds to unlocked and pending lists', () => {
    const manager = new HistoryManager();
    debugUnlockSkill(manager, 'test-skill');

    const history = manager.getHistory();
    expect(history.skillsUnlocked).toContain('test-skill');
    expect(history.pendingSkills).toContain('test-skill');
  });
});
