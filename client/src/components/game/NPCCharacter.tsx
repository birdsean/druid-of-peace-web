import { cn } from "@/lib/utils";

interface NPCStats {
  health: number;
  maxHealth: number;
  willToFight: number;
  maxWill: number;
  awareness: number;
  maxAwareness: number;
}

interface NPCCharacterProps {
  id: string;
  npc: NPCStats;
  position: 'left' | 'right';
  targetingMode: boolean;
  onClick: () => void;
  icon: string;
  color: string;
}

export default function NPCCharacter({ 
  id, 
  npc, 
  position, 
  targetingMode, 
  onClick, 
  icon, 
  color 
}: NPCCharacterProps) {
  const healthPercent = (npc.health / npc.maxHealth) * 100;
  const willPercent = (npc.willToFight / npc.maxWill) * 100;
  
  const getAwarenessColor = (awareness: number) => {
    if (awareness < 33) return 'bg-green-500';
    if (awareness < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const barDirection = position === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative">
      {/* NPC Character */}
      <div 
        className={cn(
          "w-24 h-32 rounded-lg flex items-center justify-center transition-all duration-200",
          color,
          targetingMode ? "cursor-crosshair hover:scale-105 hover:brightness-110" : "hover:brightness-110"
        )}
        onClick={onClick}
      >
        <div className="text-4xl">{icon}</div>
      </div>
      
      {/* Health Bar */}
      <div className={cn("absolute -top-16 w-28", barDirection)}>
        <div className="bg-gray-800 bg-opacity-80 rounded-full p-1">
          <div className="relative h-3 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="bar-fill h-full bg-red-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
          <div className="text-xs font-mono text-white text-center mt-1">
            {npc.health}/{npc.maxHealth}
          </div>
        </div>
      </div>
      
      {/* Will-to-Fight Bar */}
      <div className={cn("absolute -top-8 w-28", barDirection)}>
        <div className="bg-gray-800 bg-opacity-80 rounded-full p-1">
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
      
      {/* Awareness Eye */}
      <div className={cn(
        "absolute -top-2 w-6 h-6",
        position === 'left' ? '-right-2' : '-left-2'
      )}>
        <div 
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300",
            getAwarenessColor(npc.awareness)
          )}
        >
          <span className="text-white text-xs">👁</span>
        </div>
      </div>
    </div>
  );
}
