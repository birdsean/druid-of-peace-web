import { globalHistoryManager } from './history';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  hint: string;
  tags: string[];
  category: string;
  prerequisites: string[];
  connections: string[];
  position: { x: number; y: number };
  icon: string;
  type: "active" | "passive";
  effects: Record<string, any>;
  unlockRequirements?: {
    mustUseAbility?: string;
    environmentalEffect?: string;
    description?: string;
  };
}

export interface SkillTree {
  category: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  nodes: SkillNode[];
}

export interface SkillTreeData {
  skillTrees: Record<string, SkillTree>;
}

export interface SkillState {
  learnedSkills: Set<string>;
  discoveredSkills: Set<string>;
}

export interface SkillNodeDisplay extends SkillNode {
  isLearned: boolean;
  isDiscovered: boolean;
  isVisible: boolean;
  isPending: boolean;
}

class SkillTreeManager {
  private skillData: SkillTreeData | null = null;
  private skillState: SkillState = {
    learnedSkills: new Set(['calm_demeanor']), // Start with one skill learned for demo
    discoveredSkills: new Set(['calm_demeanor', 'empathic_reading', 'soothing_presence'])
  };
  private listeners: Array<(state: SkillState) => void> = [];

  async loadSkillTrees(): Promise<SkillTreeData | null> {
    try {
      const response = await fetch('/data/skills/skill-trees.json');
      if (!response.ok) {
        throw new Error(`Failed to load skill trees: ${response.statusText}`);
      }
      this.skillData = await response.json();
      return this.skillData;
    } catch (error) {
      console.error('Error loading skill trees:', error);
      return null;
    }
  }

  getSkillTrees(): SkillTreeData | null {
    return this.skillData;
  }

  getSkillTree(category: string): SkillTree | undefined {
    return this.skillData?.skillTrees[category];
  }

  getSkillNode(skillId: string): SkillNode | undefined {
    if (!this.skillData) return undefined;
    
    for (const tree of Object.values(this.skillData.skillTrees)) {
      const node = tree.nodes.find(n => n.id === skillId);
      if (node) return node;
    }
    return undefined;
  }

  getSkillState(): SkillState {
    return {
      learnedSkills: new Set(this.skillState.learnedSkills),
      discoveredSkills: new Set(this.skillState.discoveredSkills)
    };
  }

  isSkillLearned(skillId: string): boolean {
    return this.skillState.learnedSkills.has(skillId);
  }

  isSkillDiscovered(skillId: string): boolean {
    return this.skillState.discoveredSkills.has(skillId);
  }

  isSkillVisible(skillId: string): boolean {
    if (this.isSkillDiscovered(skillId)) return true;
    
    // Check if any connected skill is learned or discovered
    const skill = this.getSkillNode(skillId);
    if (!skill) return false;
    
    return skill.connections.some(connectedId => 
      this.isSkillLearned(connectedId) || this.isSkillDiscovered(connectedId)
    );
  }

  learnSkill(skillId: string): boolean {
    const skill = this.getSkillNode(skillId);
    if (!skill) return false;

    // Check if already learned
    if (this.isSkillLearned(skillId)) return false;

    // Check prerequisites
    for (const prereqId of skill.prerequisites) {
      if (!this.isSkillLearned(prereqId)) {
        return false;
      }
    }

    // Learn the skill
    this.skillState.learnedSkills.add(skillId);
    this.skillState.discoveredSkills.add(skillId);
    
    // Discover connected skills
    skill.connections.forEach(connectedId => {
      this.skillState.discoveredSkills.add(connectedId);
    });
    
    this.notifyListeners();
    return true;
  }

  getVisibleSkillsForTree(category: string): SkillNodeDisplay[] {
    const tree = this.getSkillTree(category);
    if (!tree) return [];
    
    return tree.nodes
      .filter(node => this.isSkillVisible(node.id))
      .map(node => ({
        ...node,
        isLearned: this.isSkillLearned(node.id),
        isDiscovered: this.isSkillDiscovered(node.id),
        isVisible: this.isSkillVisible(node.id),
        isPending: globalHistoryManager.isSkillPending(node.id)
      }));
  }

  getSkillEffects(skillId: string): Record<string, any> | null {
    if (!this.isSkillLearned(skillId)) return null;
    
    const skill = this.getSkillNode(skillId);
    return skill?.effects || null;
  }

  getAllLearnedSkillEffects(): Record<string, any> {
    const allEffects: Record<string, any> = {};
    
    this.skillState.learnedSkills.forEach(skillId => {
      const effects = this.getSkillEffects(skillId);
      if (effects) {
        Object.assign(allEffects, effects);
      }
    });
    
    return allEffects;
  }

  subscribe(listener: (state: SkillState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getSkillState()));
  }

  // Debug methods
  debugLearnAllSkills(): void {
    if (!this.skillData) return;
    
    Object.values(this.skillData.skillTrees).forEach(tree => {
      tree.nodes.forEach(node => {
        this.skillState.learnedSkills.add(node.id);
        this.skillState.discoveredSkills.add(node.id);
      });
    });
    
    this.notifyListeners();
  }

  debugResetSkills(): void {
    this.skillState.learnedSkills.clear();
    this.skillState.discoveredSkills.clear();
    
    // Start with calm_demeanor again
    this.skillState.learnedSkills.add('calm_demeanor');
    this.skillState.discoveredSkills.add('calm_demeanor');
    this.skillState.discoveredSkills.add('empathic_reading');
    this.skillState.discoveredSkills.add('soothing_presence');
    
    this.notifyListeners();
  }
}

// Global skill manager instance
export const globalSkillManager = new SkillTreeManager();

// Helper function to apply skill effects to game mechanics
export function applySkillEffectsToAction(baseEffect: any, actionType: string): any {
  const skillEffects = globalSkillManager.getAllLearnedSkillEffects();
  let modifiedEffect = { ...baseEffect };
  
  // Apply peaceful aura bonus from calm_demeanor
  if (actionType === 'peace_aura' && skillEffects.peaceful_aura_bonus) {
    modifiedEffect.willReduction = (modifiedEffect.willReduction || 0) + skillEffects.peaceful_aura_bonus;
  }
  
  // Apply awareness bonus from empathic_reading
  if (skillEffects.awareness_bonus) {
    modifiedEffect.awarenessChange = (modifiedEffect.awarenessChange || 0) + skillEffects.awareness_bonus;
  }
  
  // Apply other skill effects as needed
  // This can be expanded based on skill implementations
  
  return modifiedEffect;
}