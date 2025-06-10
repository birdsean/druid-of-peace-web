import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (skillIds.length > 0) {
      setIsVisible(true);
    }
  }, [skillIds]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleViewSkills = () => {
    setIsVisible(false);
    setTimeout(() => {
      onViewSkills();
      onClose();
    }, 300);
  };

  if (skillIds.length === 0) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-4 border-amber-400 rounded-lg p-6 max-w-md mx-4 shadow-2xl transform transition-all duration-300",
        isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-amber-800">
              New Skill{skillIds.length > 1 ? 's' : ''} Unlocked!
            </h2>
          </div>
          <Button
            onClick={handleClose}
            className="bg-amber-200 hover:bg-amber-300 text-amber-800 p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-amber-700 mb-4">
            You've unlocked {skillIds.length} new skill{skillIds.length > 1 ? 's' : ''}! 
            These can be claimed on the Skills screen.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            {skillIds.map((skillId, index) => (
              <div key={skillId} className="flex items-center justify-center gap-2 text-amber-800">
                <span className="text-lg">🌬️</span>
                <span className="font-medium">
                  {skillId === 'wind_whisperer' ? 'Wind Whisperer' : skillId}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleViewSkills}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-2 border-amber-500"
          >
            View Skills
          </Button>
          <Button
            onClick={handleClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 border-2 border-gray-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}