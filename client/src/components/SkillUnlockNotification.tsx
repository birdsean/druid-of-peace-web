import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { globalSkillManager, SkillNode } from '@/lib/skillTreeLoader';

interface SkillUnlockNotificationProps {
  skillIds: string[];
  onClose: () => void;
  onViewSkills: () => void;
}

export default function SkillUnlockNotification({ 
  skillIds, 
  onClose, 
  onViewSkills 
}: SkillUnlockNotificationProps) {
  const [skills, setSkills] = useState<SkillNode[]>([]);

  useEffect(() => {
    const loadSkillDetails = async () => {
      const skillTrees = globalSkillManager.getSkillTrees();
      if (skillTrees) {
        const foundSkills: SkillNode[] = [];
        Object.values(skillTrees.skillTrees).forEach(tree => {
          tree.nodes.forEach(node => {
            if (skillIds.includes(node.id)) {
              foundSkills.push(node);
            }
          });
        });
        setSkills(foundSkills);
      }
    };
    loadSkillDetails();
  }, [skillIds]);

  if (skills.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-br from-amber-600 to-yellow-500 border-4 border-yellow-300 rounded-lg p-4 shadow-2xl animate-bounce">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-white animate-pulse" />
            <h2 className="text-lg font-bold text-white font-mono">SKILL UNLOCKED!</h2>
          </div>
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white p-1 h-6 w-6 text-xs"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Skills List */}
        <div className="space-y-2 mb-4">
          {skills.map(skill => (
            <div key={skill.id} className="bg-white bg-opacity-20 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{skill.icon}</span>
                <span className="font-mono font-bold text-white text-sm">{skill.name}</span>
              </div>
              <p className="text-xs text-white opacity-90">{skill.description}</p>
              
              {/* Effects Preview */}
              {Object.keys(skill.effects).length > 0 && (
                <div className="mt-2 text-xs">
                  <div className="text-yellow-200 font-mono">EFFECTS:</div>
                  {Object.entries(skill.effects).map(([key, value]) => (
                    <div key={key} className="text-white opacity-90">
                      • {key.replace(/_/g, ' ')}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : `+${value}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onViewSkills}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono"
          >
            <Eye className="w-3 h-3 mr-1" />
            VIEW SKILLS
          </Button>
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-mono px-3"
          >
            DISMISS
          </Button>
        </div>

        {/* Hint */}
        <div className="mt-2 text-center">
          <p className="text-xs text-white opacity-75 font-mono">
            Visit the Skills page to claim your new abilities!
          </p>
        </div>
      </div>
    </div>
  );
}