import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { globalHistoryManager, HistoryManager, applyHistorySkillEffects } from '../historySystem';

describe('History System', () => {
  let historyManager: HistoryManager;

  beforeEach(() => {
    // Create a fresh instance for each test
    historyManager = new (globalHistoryManager.constructor as any)();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    historyManager.debugReset();
  });

  describe('Encounter Management', () => {
    it('should start an encounter correctly', () => {
      const startTime = Date.now();
      vi.setSystemTime(startTime);

      historyManager.startEncounter(
        'forest_clearing',
        'Forest Clearing',
        5,
        ['forest_wind'],
        'rain',
        'dawn'
      );

      const currentEncounter = historyManager.getCurrentEncounter();
      expect(currentEncounter).toMatchObject({
        zoneId: 'forest_clearing',
        zoneName: 'Forest Clearing',
        turn: 5,
        environmentalEffects: ['forest_wind'],
        weatherActive: 'rain',
        timePhase: 'dawn'
      });
    });

    it('should add player actions to current encounter', () => {
      historyManager.startEncounter('test_zone', 'Test Zone', 1, [], undefined, 'dawn');

      historyManager.addPlayerAction({
        type: 'peace_aura',
        target: 'npc1',
        roll: 5,
        effect: { willReduction: 2, description: 'Peaceful aura' }
      });

      const encounter = historyManager.getCurrentEncounter();
      expect(encounter?.actions).toHaveLength(1);
      expect(encounter?.actions[0]).toMatchObject({
        type: 'peace_aura',
        target: 'npc1',
        roll: 5
      });
    });

    it('should complete encounter and update statistics', () => {
      historyManager.startEncounter('test_zone', 'Test Zone', 1, [], undefined, 'dawn');
      
      // Add some actions
      historyManager.addPlayerAction({
        type: 'peace_aura',
        target: 'npc1',
        roll: 4,
        effect: { description: 'Test action' }
      });

      const unlockedSkills = historyManager.completeEncounter('success');
      const history = historyManager.getHistory();

      expect(history.totalEncounters).toBe(1);
      expect(history.successfulEncounters).toBe(1);
      expect(history.failedEncounters).toBe(0);
      expect(history.encounters).toHaveLength(1);
      expect(unlockedSkills).toBeInstanceOf(Array);
    });

    it('should track different encounter outcomes', () => {
      // Success
      historyManager.startEncounter('zone1', 'Zone 1', 1, [], undefined, 'dawn');
      historyManager.completeEncounter('success');

      // Failure
      historyManager.startEncounter('zone2', 'Zone 2', 2, [], undefined, 'dawn');
      historyManager.completeEncounter('failure');

      // Fled
      historyManager.startEncounter('zone3', 'Zone 3', 3, [], undefined, 'dawn');
      historyManager.completeEncounter('fled');

      const history = historyManager.getHistory();
      expect(history.totalEncounters).toBe(3);
      expect(history.successfulEncounters).toBe(1);
      expect(history.failedEncounters).toBe(1);
      expect(history.fleesCount).toBe(1);
    });
  });

  describe('Skill Unlock System', () => {
    it('should unlock skills based on encounter criteria', () => {
      historyManager.startEncounter(
        'forest_zone',
        'Forest Zone',
        1,
        ['forest_wind'],
        undefined,
        'dawn'
      );

      historyManager.addPlayerAction({
        type: 'peace_aura',
        environmentalEffects: ['forest_wind'],
        roll: 5,
        effect: { description: 'Peace in the wind' }
      });

      const unlockedSkills = historyManager.completeEncounter('success');
      
      // Should unlock wind_whisperer skill based on peace_aura + forest_wind
      expect(unlockedSkills).toContain('wind_whisperer');
    });

    it('should track pending and claimed skills separately', () => {
      // Simulate skill unlock
      historyManager.startEncounter('forest_zone', 'Forest Zone', 1, ['forest_wind'], undefined, 'dawn');
      historyManager.addPlayerAction({
        type: 'peace_aura',
        environmentalEffects: ['forest_wind'],
        roll: 5,
        effect: { description: 'Test' }
      });
      historyManager.completeEncounter('success');

      let history = historyManager.getHistory();
      expect(history.pendingSkills).toContain('wind_whisperer');
      expect(history.skillsClaimed).not.toContain('wind_whisperer');

      // Claim the skill
      const claimed = historyManager.claimSkill('wind_whisperer');
      expect(claimed).toBe(true);

      history = historyManager.getHistory();
      expect(history.pendingSkills).not.toContain('wind_whisperer');
      expect(history.skillsClaimed).toContain('wind_whisperer');
    });

    it('should not allow claiming non-pending skills', () => {
      const claimed = historyManager.claimSkill('non_existent_skill');
      expect(claimed).toBe(false);
    });

    it('should check skill status correctly', () => {
      historyManager.startEncounter('forest_zone', 'Forest Zone', 1, ['forest_wind'], undefined, 'dawn');
      historyManager.addPlayerAction({
        type: 'peace_aura',
        environmentalEffects: ['forest_wind'],
        roll: 5,
        effect: { description: 'Test' }
      });
      historyManager.completeEncounter('success');

      expect(historyManager.isSkillPending('wind_whisperer')).toBe(true);
      expect(historyManager.isSkillClaimed('wind_whisperer')).toBe(false);

      historyManager.claimSkill('wind_whisperer');

      expect(historyManager.isSkillPending('wind_whisperer')).toBe(false);
      expect(historyManager.isSkillClaimed('wind_whisperer')).toBe(true);
    });
  });

  describe('Data Queries', () => {
    beforeEach(() => {
      // Set up test data
      historyManager.startEncounter('zone1', 'Zone 1', 1, ['forest_wind'], 'rain', 'dawn');
      historyManager.addPlayerAction({
        type: 'peace_aura',
        roll: 5,
        effect: { description: 'Test 1' }
      });
      historyManager.completeEncounter('success');

      historyManager.startEncounter('zone2', 'Zone 2', 2, ['mountain_echo'], 'clear', 'noon');
      historyManager.addPlayerAction({
        type: 'observe',
        roll: 3,
        effect: { description: 'Test 2' }
      });
      historyManager.completeEncounter('failure');
    });

    it('should query encounters with specific criteria', () => {
      const successfulEncounters = historyManager.getEncountersWithCriteria({
        result: 'success'
      });
      expect(successfulEncounters).toHaveLength(1);
      expect(successfulEncounters[0].result).toBe('success');

      const windEncounters = historyManager.getEncountersWithCriteria({
        environmentalEffect: 'forest_wind'
      });
      expect(windEncounters).toHaveLength(1);
      expect(windEncounters[0].environmentalEffects).toContain('forest_wind');
    });

    it('should handle complex query criteria', () => {
      const complexQuery = historyManager.getEncountersWithCriteria({
        result: 'success',
        environmentalEffect: 'forest_wind',
        timePhase: 'dawn'
      });
      expect(complexQuery).toHaveLength(1);
    });
  });

  describe('Subscription System', () => {
    it('should notify subscribers of history changes', () => {
      const mockListener = vi.fn();
      const unsubscribe = historyManager.subscribe(mockListener);

      historyManager.startEncounter('test', 'Test', 1, [], undefined, 'dawn');
      historyManager.completeEncounter('success');

      expect(mockListener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should allow unsubscribing from notifications', () => {
      const mockListener = vi.fn();
      const unsubscribe = historyManager.subscribe(mockListener);
      
      unsubscribe();
      
      historyManager.startEncounter('test', 'Test', 1, [], undefined, 'dawn');
      historyManager.completeEncounter('success');

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Debug Functions', () => {
    it('should reset history completely', () => {
      historyManager.startEncounter('test', 'Test', 1, [], undefined, 'dawn');
      historyManager.completeEncounter('success');

      let history = historyManager.getHistory();
      expect(history.totalEncounters).toBe(1);

      historyManager.debugReset();

      history = historyManager.getHistory();
      expect(history.totalEncounters).toBe(0);
      expect(history.encounters).toHaveLength(0);
    });

    it('should allow debug skill unlocking', () => {
      historyManager.debugUnlockSkill('test_skill');

      const history = historyManager.getHistory();
      expect(history.pendingSkills).toContain('test_skill');
    });
  });

  describe('Skill Effect Application', () => {
    it('should apply skill bonuses to base effects', () => {
      const baseEffect = {
        willReduction: 2,
        description: 'Base peaceful aura'
      };

      const enhancedEffect = applyHistorySkillEffects(baseEffect, ['wind_whisperer']);

      expect(enhancedEffect.willReduction).toBeGreaterThan(baseEffect.willReduction);
      expect(enhancedEffect.description).toContain('enhanced');
    });

    it('should not modify effects when no applicable skills are claimed', () => {
      const baseEffect = {
        damage: 3,
        description: 'Base attack'
      };

      const unchangedEffect = applyHistorySkillEffects(baseEffect, ['unrelated_skill']);

      expect(unchangedEffect).toEqual(baseEffect);
    });

    it('should handle multiple skill bonuses', () => {
      const baseEffect = {
        willReduction: 2,
        description: 'Base effect'
      };

      const multiEnhanced = applyHistorySkillEffects(baseEffect, ['wind_whisperer', 'other_skill']);

      expect(multiEnhanced.willReduction).toBeGreaterThan(baseEffect.willReduction);
    });
  });
});