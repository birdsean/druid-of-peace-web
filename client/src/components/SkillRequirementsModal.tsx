import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Target, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { globalSkillManager, SkillNode } from '@/lib/skillTreeLoader';
import { globalHistoryManager } from '@/lib/history';

interface SkillRequirementsModalProps {
  onClose: () => void;
}

export default function SkillRequirementsModal({ onClose }: SkillRequirementsModalProps) {
  const [skills, setSkills] = useState<SkillNode[]>([]);

  useEffect(() => {
    const loadSkills = async () => {
      const skillTrees = globalSkillManager.getSkillTrees();
      if (skillTrees) {
        const allSkills: SkillNode[] = [];
        Object.values(skillTrees.skillTrees).forEach(tree => {
          tree.nodes.forEach(node => {
            if (node.unlockRequirements) {
              allSkills.push(node);
            }
          });
        });
        setSkills(allSkills);
      }
    };
    loadSkills();
  }, []);

  const addRequirementToHistory = (skill: SkillNode) => {
    const requirements = skill.unlockRequirements;
    if (!requirements) return;

    // Start a mock encounter
    globalHistoryManager.startEncounter(
      'test_zone',
      'Test Zone',
      1,
      requirements.environmentalEffect ? [requirements.environmentalEffect] : [],
      undefined,
      'dawn'
    );

    // Add the required action
    if (requirements.mustUseAbility) {
      globalHistoryManager.addPlayerAction({
        type: requirements.mustUseAbility as any,
        environmentalEffects: requirements.environmentalEffect ? [requirements.environmentalEffect] : [],
        roll: 6,
        effect: { description: 'Test action for skill unlock' }
      });
    }

    // Complete the encounter
    globalHistoryManager.completeEncounter('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-amber-400 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-amber-400 font-mono">SKILL REQUIREMENTS</h2>
          </div>
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(80vh-100px)]">
          {skills.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No skills with unlock requirements found</div>
          ) : (
            <div className="space-y-4">
              {skills.map(skill => (
                <div key={skill.id} className="bg-gray-800 border border-gray-600 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <h3 className="text-amber-400 font-mono font-bold">{skill.name}</h3>
                        <p className="text-xs text-gray-400">{skill.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => addRequirementToHistory(skill)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add to History
                    </Button>
                  </div>

                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm text-amber-400 font-mono mb-2">UNLOCK REQUIREMENTS:</div>
                    
                    {skill.unlockRequirements?.mustUseAbility && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-400 font-mono">ABILITY:</span>
                        <span className="ml-2 text-blue-400">{skill.unlockRequirements.mustUseAbility}</span>
                      </div>
                    )}
                    
                    {skill.unlockRequirements?.environmentalEffect && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-400 font-mono">ENVIRONMENT:</span>
                        <span className="ml-2 text-green-400">{skill.unlockRequirements.environmentalEffect}</span>
                      </div>
                    )}
                    
                    {skill.unlockRequirements?.description && (
                      <div className="mt-3 text-xs text-gray-300 italic">
                        {skill.unlockRequirements.description}
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {skill.prerequisites.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-amber-400 font-mono mb-1">PREREQUISITES:</div>
                      <div className="flex flex-wrap gap-2">
                        {skill.prerequisites.map(prereq => (
                          <span key={prereq} className="px-2 py-1 text-xs bg-gray-700 rounded font-mono text-gray-300">
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Effects */}
                  {Object.keys(skill.effects).length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-amber-400 font-mono mb-1">EFFECTS:</div>
                      <div className="text-xs text-gray-300 font-mono">
                        {Object.entries(skill.effects).map(([key, value]) => (
                          <div key={key}>• {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}