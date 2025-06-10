export interface EncounterHistory {
  id: string;
  timestamp: number;
  turn: number;
  zoneId: string;
  zoneName: string;
  result: 'success' | 'failure' | 'fled';
  environmentalEffects: string[];
  weatherActive?: string;
  timePhase: string;
  actions: PlayerAction[];
  duration: number; // in milliseconds
}

export interface PlayerAction {
  id: string;
  timestamp: number;
  type: 'peace_aura' | 'observe' | 'meditate' | 'item_use' | 'flee';
  target?: 'npc1' | 'npc2';
  itemUsed?: string;
  roll?: number;
  effect?: any;
  environmentalEffects?: string[];
  weatherActive?: string;
}

export interface PCHistoryStore {
  encounters: EncounterHistory[];
  totalEncounters: number;
  successfulEncounters: number;
  failedEncounters: number;
  fleesCount: number;
  skillsUnlocked: string[];
  skillsClaimed: string[];
  pendingSkills: string[];
}

import { checkSkillUnlocks } from './skillUnlocks';

class HistoryManager {
  private history: PCHistoryStore = {
    encounters: [],
    totalEncounters: 0,
    successfulEncounters: 0,
    failedEncounters: 0,
    fleesCount: 0,
    skillsUnlocked: [],
    skillsClaimed: [],
    pendingSkills: []
  };

  private listeners: Array<(history: PCHistoryStore) => void> = [];
  private currentEncounter: Partial<EncounterHistory> | null = null;
  private encounterStartTime = 0;

  // Start tracking a new encounter
  startEncounter(
    zoneId: string,
    zoneName: string,
    turn: number,
    environmentalEffects: string[],
    weatherActive?: string,
    timePhase: string = 'dawn'
  ): void {
    this.encounterStartTime = Date.now();
    this.currentEncounter = {
      id: `encounter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      turn,
      zoneId,
      zoneName,
      environmentalEffects,
      weatherActive,
      timePhase,
      actions: []
    };
  }

  // Add a player action to the current encounter
  addPlayerAction(action: Omit<PlayerAction, 'id' | 'timestamp'>): void {
    if (!this.currentEncounter) return;

    const playerAction: PlayerAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...action
    };

    this.currentEncounter.actions = this.currentEncounter.actions || [];
    this.currentEncounter.actions.push(playerAction);
  }

  // Complete the current encounter and check for skill unlocks
  completeEncounter(result: 'success' | 'failure' | 'fled'): string[] {
    if (!this.currentEncounter) return [];

    const duration = Date.now() - this.encounterStartTime;
    const completedEncounter: EncounterHistory = {
      ...this.currentEncounter,
      result,
      duration,
      actions: this.currentEncounter.actions || []
    } as EncounterHistory;

    // Add to history
    this.history.encounters.push(completedEncounter);
    this.history.totalEncounters++;

    // Update counters
    switch (result) {
      case 'success':
        this.history.successfulEncounters++;
        break;
      case 'failure':
        this.history.failedEncounters++;
        break;
      case 'fled':
        this.history.fleesCount++;
        break;
    }

    // Check for new skill unlocks
    const newlyUnlockedSkills = checkSkillUnlocks(this.history, completedEncounter);

    // Reset current encounter
    this.currentEncounter = null;
    this.encounterStartTime = 0;

    // Notify listeners
    this.notifyListeners();

    return newlyUnlockedSkills;
  }

  // Claim a skill (move from pending to claimed)
  claimSkill(skillId: string): boolean {
    const pendingIndex = this.history.pendingSkills.indexOf(skillId);
    if (pendingIndex === -1) return false;

    this.history.pendingSkills.splice(pendingIndex, 1);
    this.history.skillsClaimed.push(skillId);
    this.notifyListeners();
    return true;
  }

  // Get history statistics
  getHistory(): PCHistoryStore {
    return { ...this.history };
  }

  // Get current encounter info
  getCurrentEncounter(): Partial<EncounterHistory> | null {
    return this.currentEncounter ? { ...this.currentEncounter } : null;
  }

  // Check if a skill is unlocked but not claimed
  isSkillPending(skillId: string): boolean {
    return this.history.pendingSkills.includes(skillId);
  }

  // Check if a skill is claimed
  isSkillClaimed(skillId: string): boolean {
    return this.history.skillsClaimed.includes(skillId);
  }

  // Get all encounters where specific criteria were met
  getEncountersWithCriteria(criteria: {
    usedAbility?: string;
    environmentalEffect?: string;
    result?: 'success' | 'failure' | 'fled';
    zoneId?: string;
  }): EncounterHistory[] {
    return this.history.encounters.filter(encounter => {
      if (criteria.result && encounter.result !== criteria.result) return false;
      if (criteria.zoneId && encounter.zoneId !== criteria.zoneId) return false;
      if (
        criteria.environmentalEffect &&
        !encounter.environmentalEffects.includes(criteria.environmentalEffect)
      )
        return false;
      if (
        criteria.usedAbility &&
        !encounter.actions.some(action => action.type === criteria.usedAbility)
      )
        return false;
      return true;
    });
  }

  // Subscribe to history changes
  subscribe(listener: (history: PCHistoryStore) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.history));
  }

  // Debug methods
  debugReset(): void {
    this.history = {
      encounters: [],
      totalEncounters: 0,
      successfulEncounters: 0,
      failedEncounters: 0,
      fleesCount: 0,
      skillsUnlocked: [],
      skillsClaimed: [],
      pendingSkills: []
    };
    this.currentEncounter = null;
    this.encounterStartTime = 0;
    this.notifyListeners();
  }

  debugUnlockSkill(skillId: string): void {
    if (!this.history.skillsUnlocked.includes(skillId)) {
      this.history.skillsUnlocked.push(skillId);
      this.history.pendingSkills.push(skillId);
      this.notifyListeners();
    }
  }
}

// Global history manager instance
export const globalHistoryManager = new HistoryManager();

export type { HistoryManager };

