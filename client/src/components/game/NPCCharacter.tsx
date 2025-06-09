import { cn } from "@/lib/utils";

interface NPCStats {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  willToFight: number;
  maxWill: number;
  awareness: number;
  maxAwareness: number;
}

interface NPCCharacterProps {
  id: string;
  name: string;
  npc: NPCStats;
  position: 'left' | 'right';
  targetingMode: boolean;
  onClick: () => void;
  icon: string;
  color: string;
  isAnimating?: boolean;
  animationType?: 'attack' | 'hit' | 'heal';
}

export default function NPCCharacter({ 
  id, 
  name,
  npc, 
  position, 
  targetingMode, 
  onClick, 
  icon, 
  color,
  isAnimating = false,
  animationType = 'attack'
}: NPCCharacterProps) {
  const getAnimationClass = () => {
    if (!isAnimating) return '';
    switch (animationType) {
      case 'attack':
        return position === 'left' ? 'animate-attack-right' : 'animate-attack-left';
      case 'hit':
        return 'animate-hit-shake';
      case 'heal':
        return 'animate-heal-glow';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      {/* NPC Character - Only the sprite, no stats */}
      <div 
        className={cn(
          "w-24 h-32 rounded-lg flex items-center justify-center transition-all duration-200",
          color,
          targetingMode ? "cursor-crosshair hover:scale-105 hover:brightness-110" : "hover:brightness-110",
          getAnimationClass()
        )}
        onClick={onClick}
      >
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

// New component for character stats display at top of screen
export function NPCStatsDisplay({ 
  name, 
  npc, 
  position 
}: { 
  name: string; 
  npc: NPCStats; 
  position: 'left' | 'right';
}) {
  const healthPercent = (npc.health / npc.maxHealth) * 100;
  const willPercent = (npc.willToFight / npc.maxWill) * 100;
  const awarenessPercent = (npc.awareness / npc.maxAwareness) * 100;
  
  const getAwarenessColor = (awarenessPercent: number) => {
    if (awarenessPercent < 33) return 'bg-green-500';
    if (awarenessPercent < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn(
      "absolute top-4 w-48 z-30",
      position === 'left' ? 'left-4' : 'right-4'
    )}>
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-2 border border-gray-600">
        {/* Character Name */}
        <div className="text-center mb-2">
          <div className="text-sm font-mono text-white font-bold">{name}</div>
        </div>

        {/* Health Bar with Armor Overlay */}
        <div className="mb-1">
          <div className="text-xs font-mono text-gray-400 mb-1">HP</div>
          <div className="bg-gray-700 rounded-full p-1">
            <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
              {/* Health bar */}
              <div 
                className="bar-fill h-full bg-red-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${healthPercent}%` }}
              />
              {/* Armor overlay */}
              {npc.armor > 0 && (
                <div 
                  className="absolute top-0 left-0 h-full bg-gray-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(healthPercent, (npc.armor / npc.maxHealth) * 100)}%` }}
                />
              )}
            </div>
            <div className="text-xs font-mono text-white text-center">
              {npc.health}/{npc.maxHealth}{npc.armor > 0 ? ` (+${npc.armor})` : ''}
            </div>
          </div>
        </div>

        {/* Will-to-Fight Bar */}
        <div className="mb-1">
          <div className="text-xs font-mono text-gray-400 mb-1">WILL</div>
          <div className="bg-gray-700 rounded-full p-1">
            <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="bar-fill h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${willPercent}%` }}
              />
            </div>
            <div className="text-xs font-mono text-white text-center">
              {npc.willToFight > 0 ? 'FIGHT' : 'FLED'}
            </div>
          </div>
        </div>

        {/* Awareness Bar */}
        <div>
          <div className="text-xs font-mono text-gray-400 mb-1">AWARE</div>
          <div className="bg-gray-700 rounded-full p-1">
            <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "bar-fill h-full rounded-full transition-all duration-500 ease-out",
                  getAwarenessColor(awarenessPercent)
                )}
                style={{ width: `${awarenessPercent}%` }}
              />
            </div>
            <div className="text-xs font-mono text-white text-center">
              {Math.round(awarenessPercent)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}