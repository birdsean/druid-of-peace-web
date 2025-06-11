import ActionPanel from './ActionPanel';
import StatusBar from './StatusBar';
import type { PCAbility } from '@/lib/characterLoader';

interface PlayerUtilsPanelProps {
  actionPoints: number;
  maxActionPoints: number;
  abilities: PCAbility[];
  targetingMode: boolean;
  canUseActions: boolean;
  combatLogMode: 'hidden' | 'small' | 'large';
  showDebugPanel: boolean;
  onAbilityUse: (abilityKey: string) => void;
  onToggleCombatLog: () => void;
  onToggleDebug: () => void;
  onEndTurn: () => void;
  onFlee: () => void;
  onOpenInventory: () => void;
}

export default function PlayerUtilsPanel({
  actionPoints,
  maxActionPoints,
  abilities,
  targetingMode,
  canUseActions,
  combatLogMode,
  showDebugPanel,
  onAbilityUse,
  onToggleCombatLog,
  onToggleDebug,
  onEndTurn,
  onFlee,
  onOpenInventory,
}: PlayerUtilsPanelProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 shadow-lg border-t-2 border-orange-400">
        <div className="flex items-center justify-between">
          {/* Left side - PC Character Token and Action Points */}
          <div className="flex items-center space-x-4">
            {/* PC Character Token */}
            <div className="relative">
              <div className="w-12 h-12 bg-green-700 rounded-full border-4 border-green-400 flex items-center justify-center text-lg shadow-lg">
                🌿
              </div>
            </div>

            {/* Action Points */}
            <div className="text-center">
              <div className="text-xs font-mono text-orange-200 mb-1">AP</div>
              <div className="text-lg font-mono text-white font-bold">
                {actionPoints}/{maxActionPoints}
              </div>
            </div>
          </div>

          {/* Center - Abilities */}
          <div className="flex-1 flex justify-center">
            <ActionPanel
              abilities={abilities}
              actionPoints={actionPoints}
              canUseActions={canUseActions}
              onAbilityUse={onAbilityUse}
            />
          </div>

          {/* Right side - Utils and Status */}
          <StatusBar
            targetingMode={targetingMode}
            canUseActions={canUseActions}
            combatLogMode={combatLogMode}
            showDebugPanel={showDebugPanel}
            onToggleCombatLog={onToggleCombatLog}
            onToggleDebug={onToggleDebug}
            onEndTurn={onEndTurn}
            onFlee={onFlee}
            onOpenInventory={onOpenInventory}
          />
        </div>
      </div>
    </div>
  );
}
