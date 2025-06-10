import type { HistoryManager } from './historySystem';

export function debugReset(manager: HistoryManager): void {
  const m = manager as any;
  m.history = {
    encounters: [],
    totalEncounters: 0,
    successfulEncounters: 0,
    failedEncounters: 0,
    fleesCount: 0,
    skillsUnlocked: [],
    skillsClaimed: [],
    pendingSkills: []
  };
  m.currentEncounter = null;
  m.encounterStartTime = 0;
  manager['notifyListeners']?.();
}

export function debugUnlockSkill(manager: HistoryManager, skillId: string): void {
  const m = manager as any;
  if (!m.history.skillsUnlocked.includes(skillId)) {
    m.history.skillsUnlocked.push(skillId);
    m.history.pendingSkills.push(skillId);
    manager['notifyListeners']?.();
  }
}
