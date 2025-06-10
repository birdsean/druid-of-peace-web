import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../lib/historySystem', () => ({
  globalHistoryManager: {
    isSkillPending: vi.fn()
  }
}));

import { globalHistoryManager } from '../lib/historySystem';
import type { SkillTreeData } from '../lib/skillTreeLoader';
import { globalSkillManager, applySkillEffectsToAction } from '../lib/skillTreeLoader';

const testSkillData: SkillTreeData = {
  skillTrees: {
    test: {
      category: 'test',
      name: 'Test Tree',
      description: 'desc',
      icon: 't',
      color: '#000',
      nodes: [
        {
          id: 'skillA',
          name: 'Skill A',
          description: '',
          hint: '',
          tags: [],
          category: 'test',
          prerequisites: [],
          connections: ['skillB'],
          position: { x: 0, y: 0 },
          icon: 'A',
          type: 'passive',
          effects: { peaceful_aura_bonus: 10 }
        },
        {
          id: 'skillB',
          name: 'Skill B',
          description: '',
          hint: '',
          tags: [],
          category: 'test',
          prerequisites: ['skillA'],
          connections: ['skillA', 'skillC'],
          position: { x: 0, y: 0 },
          icon: 'B',
          type: 'passive',
          effects: {}
        },
        {
          id: 'skillC',
          name: 'Skill C',
          description: '',
          hint: '',
          tags: [],
          category: 'test',
          prerequisites: [],
          connections: ['skillB'],
          position: { x: 0, y: 0 },
          icon: 'C',
          type: 'passive',
          effects: { awareness_bonus: 15 }
        }
      ]
    }
  }
};

function setInitialState() {
  (globalSkillManager as any).skillData = testSkillData;
  (globalSkillManager as any).skillState = {
    learnedSkills: new Set(['skillA']),
    discoveredSkills: new Set(['skillA'])
  };
}

describe('SkillTreeLoader', () => {
  beforeEach(() => {
    (globalHistoryManager.isSkillPending as any).mockReset();
    setInitialState();
  });

  describe('learnSkill', () => {
    it('respects prerequisites and discovers connections', () => {
      (globalSkillManager as any).skillState.learnedSkills.clear();
      let result = globalSkillManager.learnSkill('skillB');
      expect(result).toBe(false);

      (globalSkillManager as any).skillState.learnedSkills.add('skillA');
      result = globalSkillManager.learnSkill('skillB');
      expect(result).toBe(true);

      const state = globalSkillManager.getSkillState();
      expect(state.learnedSkills.has('skillB')).toBe(true);
      expect(state.discoveredSkills.has('skillC')).toBe(true);
    });
  });

  describe('getVisibleSkillsForTree', () => {
    it('marks pending skills', () => {
      (globalSkillManager as any).skillState.discoveredSkills = new Set(['skillA', 'skillB', 'skillC']);
      (globalHistoryManager.isSkillPending as any).mockImplementation((id: string) => id === 'skillB');

      const visible = globalSkillManager.getVisibleSkillsForTree('test');
      const skillB = visible.find(s => s.id === 'skillB');
      expect(skillB?.isPending).toBe(true);
    });
  });

  describe('applySkillEffectsToAction', () => {
    it('modifies effects based on learned skills', () => {
      (globalSkillManager as any).skillState.learnedSkills = new Set(['skillA', 'skillC']);
      const result = applySkillEffectsToAction({ willReduction: 10 }, 'peace_aura');
      expect(result.willReduction).toBe(20);
      expect(result.awarenessChange).toBe(15);
    });
  });
});
