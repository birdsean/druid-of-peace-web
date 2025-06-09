import { Shield, Users, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerActionPanelProps {
  actionPoints: number;
  maxActionPoints: number;
  targetingMode: boolean;
  onPeaceAbility: () => void;
  onEndTurn: () => void;
  onToggleCombatLog: () => void;
  combatLogMode: 'hidden' | 'small' | 'large';
  isPlayerTurn: boolean;
}

export default function PlayerActionPanel({
  actionPoints,
  maxActionPoints,
  targetingMode,
  onPeaceAbility,
  onEndTurn,
  onToggleCombatLog,
  combatLogMode,
  isPlayerTurn
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
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-t-lg p-4 shadow-lg border-2 border-orange-400">
        <div className="flex items-center justify-between">
          {/* Left side - Action Points */}
          <div className="flex items-center space-x-4">
            <div className="text-white font-mono">
              <div className="text-xs text-orange-200">ACTION POINTS</div>
              <div className="text-lg font-bold">
                {actionPoints}/{maxActionPoints}
              </div>
            </div>
            
            {/* Action point dots */}
            <div className="flex space-x-1">
              {Array.from({ length: maxActionPoints }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-orange-200",
                    i < actionPoints 
                      ? "bg-yellow-300 shadow-lg" 
                      : "bg-orange-800"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Center - Action Buttons */}
          <div className="flex space-x-2">
            {/* Peace Aura Action */}
            <Button
              onClick={onPeaceAbility}
              disabled={!canUseActions || !hasActionPoints}
              className={cn(
                "w-12 h-12 p-0 rounded-lg transition-all duration-200",
                canUseActions && hasActionPoints
                  ? "bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 shadow-lg hover:shadow-xl"
                  : "bg-gray-600 border-2 border-gray-500 opacity-50 cursor-not-allowed"
              )}
              title="Peace Aura - Reduce target's will to fight"
            >
              <Shield className="w-6 h-6 text-white" />
            </Button>

            {/* End Turn Action */}
            <Button
              onClick={onEndTurn}
              disabled={!isPlayerTurn || targetingMode}
              className={cn(
                "w-12 h-12 p-0 rounded-lg transition-all duration-200",
                isPlayerTurn && !targetingMode
                  ? "bg-green-600 hover:bg-green-700 border-2 border-green-400 shadow-lg hover:shadow-xl"
                  : "bg-gray-600 border-2 border-gray-500 opacity-50 cursor-not-allowed"
              )}
              title="End Turn"
            >
              <Users className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* Right side - Combat Log Control */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={onToggleCombatLog}
              className="w-10 h-10 p-0 rounded-lg bg-amber-700 hover:bg-amber-800 border-2 border-amber-500"
              title={`Combat Log: ${combatLogMode}`}
            >
              <CombatLogIcon className="w-5 h-5 text-white" />
            </Button>
            <div className="text-white font-mono text-xs">
              <div className="text-orange-200">LOG</div>
              <div className="capitalize">{combatLogMode}</div>
            </div>
          </div>
        </div>

        {/* Targeting mode indicator */}
        {targetingMode && (
          <div className="mt-2 text-center text-yellow-200 font-mono text-sm animate-pulse">
            Select target for Peace Aura
          </div>
        )}
      </div>
    </div>
  );
}