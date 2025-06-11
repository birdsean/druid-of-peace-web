import { Eye, EyeOff, Maximize2, Minimize2, TreePine, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PCAbility } from '@/lib/characterLoader';

interface PlayerActionPanelProps {
  actionPoints: number;
  maxActionPoints: number;
  targetingMode: boolean;
  abilities: PCAbility[];
  onAbilityUse: (abilityKey: string) => void;
  onEndTurn: () => void;
  onOpenInventory?: () => void;
  onOpenSkills?: () => void;
  onExitGame?: () => void;
  onToggleCombatLog: () => void;
  combatLogMode: 'hidden' | 'small' | 'large';
  isPlayerTurn: boolean;
  onCancelAction: () => void;
}

export default function PlayerActionPanel({
  actionPoints,
  maxActionPoints,
  targetingMode,
  abilities,
  onAbilityUse,
  onEndTurn,
  onOpenInventory,
  onOpenSkills,
  onExitGame,
  onToggleCombatLog,
  combatLogMode,
  isPlayerTurn,
  onCancelAction,
}: PlayerActionPanelProps) {
  const hasActionPoints = actionPoints > 0;
  const canUseActions = isPlayerTurn && !targetingMode;

  const getCombatLogIcon = () => {
    switch (combatLogMode) {
      case 'hidden': return EyeOff;
      case 'small': return Eye;
      case 'large': return Minimize2;
      default: return Eye;
    }
  };

  const CombatLogIcon = getCombatLogIcon();

  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-30">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-t-lg p-4 shadow-lg border-2 border-orange-400">
        <div className="flex items-center justify-between">
          {/* Left side - Druid Character and Action Points */}
          <div className="flex items-center space-x-4">
            {/* Druid Character Icon */}
            <div className="relative">
              <div className="w-16 h-16 bg-green-700 rounded-full border-4 border-green-400 flex items-center justify-center text-2xl shadow-lg">
                🌿
              </div>
              {/* Action Points above character */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white font-mono text-center">
                <div className="text-xs text-orange-200">AP</div>
                <div className="text-sm font-bold bg-orange-800 rounded px-2 py-1">
                  {actionPoints}/{maxActionPoints}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Action Buttons */}
          <div className="flex space-x-3 ml-8">
            {(abilities || []).map((ability) => (
              <Button
                key={ability.key}
                onClick={() => onAbilityUse(ability.key)}
                disabled={!canUseActions || actionPoints < ability.cost}
                className={cn(
                  "w-14 h-14 p-0 rounded-lg transition-all duration-200 text-2xl",
                  canUseActions && actionPoints >= ability.cost
                    ? "bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 shadow-lg hover:shadow-xl"
                    : "bg-gray-600 border-2 border-gray-500 opacity-50 cursor-not-allowed"
                )}
                title={`${ability.name} - ${ability.description}`}
              >
                {ability.icon}
              </Button>
            ))}
          </div>

          {/* Right side - Utility Buttons */}
          <div className="flex items-center space-x-2">
            {onOpenSkills && (
              <Button
                onClick={onOpenSkills}
                className="w-14 h-14 p-0 rounded-lg bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 text-white transition-all duration-200"
                title="Open Skills"
              >
                <TreePine className="w-5 h-5" />
              </Button>
            )}
            {onOpenInventory && (
              <Button
                onClick={onOpenInventory}
                className="w-14 h-14 p-0 rounded-lg bg-amber-600 hover:bg-amber-700 border-2 border-amber-400 text-white transition-all duration-200"
                title="Open Inventory"
              >
                <Package className="w-5 h-5" />
              </Button>
            )}
            {onExitGame && (
              <Button
                onClick={onExitGame}
                className="w-14 h-14 p-0 rounded-lg bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white transition-all duration-200"
                title="Exit Game"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={onEndTurn}
              disabled={!isPlayerTurn || targetingMode}
              className={cn(
                "w-14 h-14 p-0 rounded-lg transition-all duration-200 text-xl",
                isPlayerTurn && !targetingMode
                  ? "bg-green-600 hover:bg-green-700 border-2 border-green-400 shadow-lg hover:shadow-xl"
                  : "bg-gray-600 border-2 border-gray-500 opacity-50 cursor-not-allowed"
              )}
              title="End Turn"
            >
              ⏭️
            </Button>
            
            <Button
              onClick={onToggleCombatLog}
              className="w-14 h-14 p-0 rounded-lg bg-amber-600 hover:bg-amber-700 border-2 border-amber-400 transition-all duration-200"
              title={`Combat Log: ${combatLogMode}`}
            >
              <CombatLogIcon className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Targeting mode indicator */}
        {targetingMode && (
          <div className="mt-2 flex items-center justify-center text-yellow-200 font-mono text-sm">
            <span className="animate-pulse mr-2">Select target for Peace Aura</span>
            <Button
              onClick={onCancelAction}
              className="w-6 h-6 p-0 bg-gray-600 hover:bg-gray-700 border-2 border-gray-400 text-white"
              title="Cancel pending action"
            >
              ❌
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}