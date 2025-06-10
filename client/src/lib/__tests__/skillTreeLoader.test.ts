import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { globalSkillManager, SkillManager } from '../skillTreeLoader';

// Mock fetch
global.fetch = vi.fn();

describe('Skill Tree System', () => {
  let skillManager: SkillManager;

  beforeEach(() => {
    vi.clearAllMocks();
    skillManager = new (globalSkillManager.constructor as any)();
  });

  afterEach(() => {
    skillManager.debugResetState();
  });

  describe('Skill Tree Loading', () => {
    const mockSkillTreeData = {
      skillTrees: {
        diplomacy: {
          id: 'diplomacy',
          name: 'Diplomacy',
          description: 'Arts of peaceful resolution',
          icon: '🕊️',
          color: '#22c55e',
          nodes: [
            {
              id: 'calm_demeanor',
              name: 'Calm Demeanor',
              description: 'Maintain composure in tense situations',
              hint: 'Peace begins with inner tranquility',
              tags: ['diplomacy', 'passive'],
              category: 'diplomacy',
              prerequisites: [],
              connections: ['empathic_reading'],
              position: { x: 200, y: 100 },
              icon: '😌',
              type: 'passive',
              effects: { peaceful_aura_bonus: 10 }
            },
            {
              id: 'wind_whisperer',
              name: 'Wind Whisperer',
              description: 'Harness forest winds to enhance peaceful presence',
              hint: 'Use Peaceful Aura while forest winds blow',
              tags: ['diplomacy', 'environmental'],
              category: 'diplomacy',
              prerequisites: ['calm_demeanor'],
              connections: ['calm_demeanor'],
              position: { x: 200, y: 300 },
              icon: '🌬️',
              type: 'passive',
              effects: { peaceful_aura_bonus: 10 },
              unlockRequirements: {
                mustUseAbility: 'peace_aura',
                environmentalEffect: 'forest_wind',
                description: 'Use Peaceful Aura while forest wind environmental effect is active'
              }
            }
          ]
        }
      }
    };

    it('should load skill trees from data successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSkillTreeData
      } as Response);

      const result = await skillManager.loadSkillTrees();

      expect(fetch).toHaveBeenCalledWith('/data/skills/skill-trees.json');
      expect(result).toEqual(mockSkillTreeData);
      expect(skillManager.getSkillTrees()).toEqual(mockSkillTreeData);
    });

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await skillManager.loadSkillTrees();

      expect(result).toBeNull();
      expect(skillManager.getSkillTrees()).toBeNull();
    });

    it('should handle invalid JSON responses', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      } as Response);

      const result = await skillManager.loadSkillTrees();

      expect(result).toBeNull();
    });
  });

  describe('Skill State Management', () => {
    beforeEach(async () => {
      const mockData = {
        skillTrees: {
          diplomacy: {
            id: 'diplomacy',
            name: 'Diplomacy',
            nodes: [
              {
                id: 'calm_demeanor',
                name: 'Calm Demeanor',
                prerequisites: [],
                connections: ['empathic_reading'],
                position: { x: 200, y: 100 },
                effects: {}
              },
              {
                id: 'empathic_reading',
                name: 'Empathic Reading',
                prerequisites: ['calm_demeanor'],
                connections: [],
                position: { x: 100, y: 200 },
                effects: {}
              }
            ]
          }
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      await skillManager.loadSkillTrees();
    });

    it('should learn skills and update state correctly', () => {
      expect(skillManager.isSkillLearned('calm_demeanor')).toBe(false);

      skillManager.learnSkill('calm_demeanor');

      expect(skillManager.isSkillLearned('calm_demeanor')).toBe(true);
    });

    it('should check skill discovery based on prerequisites', () => {
      expect(skillManager.isSkillDiscovered('empathic_reading')).toBe(false);

      skillManager.learnSkill('calm_demeanor');

      expect(skillManager.isSkillDiscovered('empathic_reading')).toBe(true);
    });

    it('should get visible skills for a tree correctly', () => {
      const visibleSkills = skillManager.getVisibleSkillsForTree('diplomacy');

      expect(visibleSkills).toHaveLength(2);
      expect(visibleSkills[0].id).toBe('calm_demeanor');
      expect(visibleSkills[0].isDiscovered).toBe(true);
      expect(visibleSkills[1].id).toBe('empathic_reading');
      expect(visibleSkills[1].isDiscovered).toBe(false);
    });

    it('should update visibility when skills are learned', () => {
      skillManager.learnSkill('calm_demeanor');
      
      const visibleSkills = skillManager.getVisibleSkillsForTree('diplomacy');
      const empathicReading = visibleSkills.find(s => s.id === 'empathic_reading');

      expect(empathicReading?.isDiscovered).toBe(true);
      expect(empathicReading?.isLearned).toBe(false);
    });
  });

  describe('Skill Unlock Requirements', () => {
    beforeEach(async () => {
      const mockData = {
        skillTrees: {
          diplomacy: {
            id: 'diplomacy',
            name: 'Diplomacy',
            nodes: [
              {
                id: 'wind_whisperer',
                name: 'Wind Whisperer',
                prerequisites: [],
                connections: [],
                position: { x: 200, y: 300 },
                effects: { peaceful_aura_bonus: 10 },
                unlockRequirements: {
                  mustUseAbility: 'peace_aura',
                  environmentalEffect: 'forest_wind',
                  description: 'Use Peaceful Aura while forest wind is active'
                }
              }
            ]
          }
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      await skillManager.loadSkillTrees();
    });

    it('should check unlock requirements correctly', () => {
      const requirements = skillManager.getSkillUnlockRequirements('wind_whisperer');

      expect(requirements).toEqual({
        mustUseAbility: 'peace_aura',
        environmentalEffect: 'forest_wind',
        description: 'Use Peaceful Aura while forest wind is active'
      });
    });

    it('should return null for skills without unlock requirements', () => {
      const requirements = skillManager.getSkillUnlockRequirements('nonexistent_skill');

      expect(requirements).toBeNull();
    });

    it('should validate unlock conditions', () => {
      const conditions = {
        ability: 'peace_aura',
        environmentalEffect: 'forest_wind'
      };

      const isValid = skillManager.validateUnlockConditions('wind_whisperer', conditions);

      expect(isValid).toBe(true);
    });

    it('should reject invalid unlock conditions', () => {
      const conditions = {
        ability: 'wrong_ability',
        environmentalEffect: 'forest_wind'
      };

      const isValid = skillManager.validateUnlockConditions('wind_whisperer', conditions);

      expect(isValid).toBe(false);
    });
  });

  describe('Subscription System', () => {
    it('should notify subscribers when skills are learned', () => {
      const mockListener = vi.fn();
      const unsubscribe = skillManager.subscribe(mockListener);

      skillManager.learnSkill('test_skill');

      expect(mockListener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should allow unsubscribing from notifications', () => {
      const mockListener = vi.fn();
      const unsubscribe = skillManager.subscribe(mockListener);

      unsubscribe();
      skillManager.learnSkill('test_skill');

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Debug Functions', () => {
    beforeEach(async () => {
      const mockData = {
        skillTrees: {
          diplomacy: {
            id: 'diplomacy',
            nodes: [
              { id: 'skill1', prerequisites: [], connections: [], position: { x: 0, y: 0 }, effects: {} },
              { id: 'skill2', prerequisites: [], connections: [], position: { x: 0, y: 0 }, effects: {} }
            ]
          }
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      await skillManager.loadSkillTrees();
    });

    it('should learn all skills in debug mode', () => {
      skillManager.debugLearnAllSkills();

      expect(skillManager.isSkillLearned('skill1')).toBe(true);
      expect(skillManager.isSkillLearned('skill2')).toBe(true);
    });

    it('should reset state completely', () => {
      skillManager.learnSkill('skill1');
      expect(skillManager.isSkillLearned('skill1')).toBe(true);

      skillManager.debugResetState();

      expect(skillManager.isSkillLearned('skill1')).toBe(false);
      expect(skillManager.getSkillTrees()).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty skill trees', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ skillTrees: {} })
      } as Response);

      await skillManager.loadSkillTrees();
      const visibleSkills = skillManager.getVisibleSkillsForTree('nonexistent');

      expect(visibleSkills).toEqual([]);
    });

    it('should handle learning nonexistent skills gracefully', () => {
      expect(() => skillManager.learnSkill('nonexistent_skill')).not.toThrow();
      expect(skillManager.isSkillLearned('nonexistent_skill')).toBe(false);
    });

    it('should handle circular dependencies in skill prerequisites', async () => {
      const mockData = {
        skillTrees: {
          test: {
            id: 'test',
            nodes: [
              {
                id: 'skill_a',
                prerequisites: ['skill_b'],
                connections: [],
                position: { x: 0, y: 0 },
                effects: {}
              },
              {
                id: 'skill_b',
                prerequisites: ['skill_a'],
                connections: [],
                position: { x: 0, y: 0 },
                effects: {}
              }
            ]
          }
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response);

      await skillManager.loadSkillTrees();

      // Both skills should be undiscovered due to circular dependency
      expect(skillManager.isSkillDiscovered('skill_a')).toBe(false);
      expect(skillManager.isSkillDiscovered('skill_b')).toBe(false);
    });
  });
});