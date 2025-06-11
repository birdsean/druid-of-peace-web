import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IS_DEBUG } from "@/lib/debug";
import {
  Eye,
  EyeOff,
  Minimize2,
  Settings,
  Package,
} from "lucide-react";
import type { ReactElement } from "react";

interface StatusBarProps {
  targetingMode: boolean;
  canUseActions: boolean;
  combatLogMode: "hidden" | "small" | "large";
  showDebugPanel: boolean;
  onToggleCombatLog: () => void;
  onToggleDebug: () => void;
  onEndTurn: () => void;
  onFlee: () => void;
  onOpenInventory: () => void;
  onCancelAction: () => void;
}

export default function StatusBar({
  targetingMode,
  canUseActions,
  combatLogMode,
  showDebugPanel,
  onToggleCombatLog,
  onToggleDebug,
  onEndTurn,
  onFlee,
  onOpenInventory,
  onCancelAction,
}: StatusBarProps) {
  const getCombatLogIcon = (): ReactElement => {
    switch (combatLogMode) {
      case "hidden":
        return <EyeOff className="w-5 h-5" />;
      case "small":
        return <Eye className="w-5 h-5" />;
      case "large":
        return <Minimize2 className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right mr-4">
        <div className="text-xs font-mono text-orange-200 mb-1">STATUS</div>
        <div className="text-sm font-mono text-white">
          {targetingMode ? "🎯 TARGETING" : "✋ READY"}
        </div>
      </div>
      <div className="flex items-center space-x-2 border-l border-orange-300 pl-4">
        {targetingMode && (
          <Button
            onClick={onCancelAction}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 border-2 border-gray-400 text-white"
            title="Cancel pending action"
          >
            ❌
          </Button>
        )}
        <Button
          onClick={onToggleCombatLog}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white"
          title={`Combat Log: ${combatLogMode}`}
        >
          {getCombatLogIcon()}
        </Button>
        <Button
          onClick={onOpenInventory}
          disabled={!canUseActions}
          className={cn(
            "w-12 h-12 border-2 transition-all duration-200",
            canUseActions
              ? "bg-amber-600 hover:bg-amber-700 border-amber-400 text-white"
              : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
          )}
          title="Use Item"
        >
          <Package className="w-5 h-5" />
        </Button>
        {IS_DEBUG && (
          <Button
            onClick={onToggleDebug}
            className={cn(
              "w-12 h-12 border-2 transition-all duration-200",
              showDebugPanel
                ? "bg-yellow-700 border-yellow-500 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 border-yellow-400 text-white",
            )}
            title="Toggle debug panel"
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}
        <Button
          onClick={onEndTurn}
          disabled={!canUseActions}
          className={cn(
            "w-12 h-12 border-2 transition-all duration-200",
            canUseActions
              ? "bg-orange-600 hover:bg-orange-700 border-orange-400 text-white"
              : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
          )}
          title="End Turn"
        >
          ⏰
        </Button>
        <Button
          onClick={onFlee}
          disabled={!canUseActions}
          className={cn(
            "w-12 h-12 border-2 transition-all duration-200",
            canUseActions
              ? "bg-red-600 hover:bg-red-700 border-red-400 text-white"
              : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
          )}
          title="Flee from encounter"
        >
          🏃
        </Button>
      </div>
    </div>
  );
}
