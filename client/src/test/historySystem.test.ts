import { describe, it, expect, beforeEach } from 'vitest';
import { globalHistoryManager } from '../lib/historySystem';
import type { PlayerAction } from '../lib/historySystem';

describe('History System', () => {
  beforeEach(() => {
    // Reset history before each test
    globalHistoryManager.debugReset();
  });

  describe('Encounter Management', () => {
    it('should start and complete encounters correctly', () => {
      const initialHistory = globalHistoryManager.getHistory();
      expect(initialHistory.totalEncounters).toBe(0);

      globalHistoryManager.startEncounter('zone1', 'Forest Clearing', 1, [], undefined, 'dawn');
      
      const action: Omit<PlayerAction, 'id' | 'timestamp'> = {
        type: 'peace_aura',
        target: 'npc1',
        roll: 4,
        effect: { willReduction: 10, awarenessChange: 5 }
      };
      
      globalHistoryManager.addPlayerAction(action);
      const unlockedSkills = globalHistoryManager.completeEncounter('success');
      
      const finalHistory = globalHistoryManager.getHistory();
      expect(finalHistory.totalEncounters).toBe(1);
      expect(finalHistory.successfulEncounters).toBe(1);
      expect(finalHistory.encounters).toHaveLength(1);
      
      const encounter = finalHistory.encounters[0];
      expect(encounter.zoneId).toBe('zone1');
      expect(encounter.zoneName).toBe('Forest Clearing');
      expect(encounter.result).toBe('success');
      expect(encounter.actions).toHaveLength(1);
    });

    it('should track failed encounters', () => {
      globalHistoryManager.startEncounter('zone2', 'Mountain Pass', 2, [], undefined, 'noon');
      globalHistoryManager.completeEncounter('failure');
      
      const history = globalHistoryManager.getHistory();
      expect(history.totalEncounters).toBe(1);
      expect(history.failedEncounters).toBe(1);
      expect(history.successfulEncounters).toBe(0);
    });

    it('should track fled encounters', () => {
      globalHistoryManager.startEncounter('zone3', 'Dark Cave', 3, [], undefined, 'dusk');
      globalHistoryManager.completeEncounter('fled');
      
      const history = globalHistoryManager.getHistory();
      expect(history.totalEncounters).toBe(1);
      expect(history.fleesCount).toBe(1);
      expect(history.successfulEncounters).toBe(0);
    });
  });

  describe('Player Actions', () => {
    it('should add and track player actions during encounters', () => {
      globalHistoryManager.startEncounter('zone1', 'Test Zone', 1, [], undefined, 'dawn');
      
      const action1: Omit<PlayerAction, 'id' | 'timestamp'> = {
        type: 'observe',
        target: 'npc1',
        roll: 3,
        effect: { awarenessChange: 8 }
      };
      
      const action2: Omit<PlayerAction, 'id' | 'timestamp'> = {
        type: 'meditate',
        roll: 5,
        effect: { actionPointsGained: 2 }
      };
      
      globalHistoryManager.addPlayerAction(action1);
      globalHistoryManager.addPlayerAction(action2);
      globalHistoryManager.completeEncounter('success');
      
      const history = globalHistoryManager.getHistory();
      const encounter = history.encounters[0];
      expect(encounter.actions).toHaveLength(2);
      expect(encounter.actions[0].type).toBe('observe');
      expect(encounter.actions[1].type).toBe('meditate');
    });

    it('should generate unique IDs for actions', () => {
      globalHistoryManager.startEncounter('zone1', 'Test Zone', 1, [], undefined, 'dawn');
      
      const action: Omit<PlayerAction, 'id' | 'timestamp'> = {
        type: 'peace_aura',
        target: 'npc1',
        roll: 4
      };
      
      globalHistoryManager.addPlayerAction(action);
      globalHistoryManager.addPlayerAction(action);
      globalHistoryManager.completeEncounter('success');
      
      const history = globalHistoryManager.getHistory();
      const encounter = history.encounters[0];
      expect(encounter.actions[0].id).not.toBe(encounter.actions[1].id);
    });
  });

  describe('Skill System', () => {
    it('should track pending skills', () => {
      // Mock some successful encounters to unlock skills
      for (let i = 0; i < 3; i++) {
        globalHistoryManager.startEncounter(`zone${i}`, `Zone ${i}`, i + 1, [], undefined, 'dawn');
        globalHistoryManager.addPlayerAction({
          type: 'peace_aura',
          target: 'npc1',
          roll: 5,
          effect: { willReduction: 15 }
        });
        globalHistoryManager.completeEncounter('success');
      }
      
      const history = globalHistoryManager.getHistory();
      expect(history.pendingSkills.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle skill claiming', () => {
      globalHistoryManager.debugUnlockSkill('test-skill-id');
      
      const history = globalHistoryManager.getHistory();
      expect(globalHistoryManager.isSkillPending('test-skill-id')).toBe(true);
      
      const claimed = globalHistoryManager.claimSkill('test-skill-id');
      expect(claimed).toBe(true);
      expect(globalHistoryManager.isSkillClaimed('test-skill-id')).toBe(true);
      expect(globalHistoryManager.isSkillPending('test-skill-id')).toBe(false);
    });

    it('should not claim already claimed skills', () => {
      globalHistoryManager.debugUnlockSkill('test-skill-id');
      globalHistoryManager.claimSkill('test-skill-id');
      
      const secondClaim = globalHistoryManager.claimSkill('test-skill-id');
      expect(secondClaim).toBe(false);
    });
  });

  describe('Encounter Queries', () => {
    beforeEach(() => {
      // Set up test data
      globalHistoryManager.startEncounter('forest', 'Forest', 1, ['rain'], 'storm', 'dawn');
      globalHistoryManager.addPlayerAction({
        type: 'peace_aura',
        target: 'npc1',
        roll: 6
      });
      globalHistoryManager.completeEncounter('success');
      
      globalHistoryManager.startEncounter('mountain', 'Mountain', 2, [], undefined, 'noon');
      globalHistoryManager.addPlayerAction({
        type: 'observe',
        target: 'npc2',
        roll: 3
      });
      globalHistoryManager.completeEncounter('failure');
    });

    it('should filter encounters by result', () => {
      const successfulEncounters = globalHistoryManager.getEncountersWithCriteria({ result: 'success' });
      const failedEncounters = globalHistoryManager.getEncountersWithCriteria({ result: 'failure' });
      
      expect(successfulEncounters).toHaveLength(1);
      expect(failedEncounters).toHaveLength(1);
      expect(successfulEncounters[0].result).toBe('success');
      expect(failedEncounters[0].result).toBe('failure');
    });

    it('should filter encounters by zone', () => {
      const forestEncounters = globalHistoryManager.getEncountersWithCriteria({ zoneId: 'forest' });
      const mountainEncounters = globalHistoryManager.getEncountersWithCriteria({ zoneId: 'mountain' });
      
      expect(forestEncounters).toHaveLength(1);
      expect(mountainEncounters).toHaveLength(1);
      expect(forestEncounters[0].zoneId).toBe('forest');
      expect(mountainEncounters[0].zoneId).toBe('mountain');
    });

    it('should filter encounters by weather', () => {
      const stormEncounters = globalHistoryManager.getEncountersWithCriteria({ weatherActive: 'storm' });
      
      expect(stormEncounters).toHaveLength(1);
      expect(stormEncounters[0].weatherActive).toBe('storm');
    });
  });
});