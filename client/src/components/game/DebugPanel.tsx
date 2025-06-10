import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IS_DEBUG, DebugState } from "@/lib/debug";
import { Play, Pause, Sword, Shield } from "lucide-react";

interface DebugPanelProps {
  visible: boolean;
  debugState: DebugState;
  onToggleAutoTurn: () => void;
  onNPCAction: (npcId: "npc1" | "npc2", action: "attack" | "defend") => void;
}

export default function DebugPanel({
  visible,
  debugState,
  onToggleAutoTurn,
  onNPCAction,
}: DebugPanelProps) {
  if (!IS_DEBUG || !visible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-gray-900 rounded-lg p-4 shadow-lg border-2 border-yellow-400 min-w-64">
        <div className="text-center mb-3">
          <div className="text-sm font-mono text-yellow-400">DEBUG CONTROLS</div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            onClick={onToggleAutoTurn}
            className={cn(
              "w-full h-10 text-sm border-2 transition-all duration-200",
              debugState.autoTurn
                ? "bg-green-600 hover:bg-green-700 border-green-400 text-white"
                : "bg-red-600 hover:bg-red-700 border-red-400 text-white",
            )}
            title="Toggle automatic NPC turns"
          >
            {debugState.autoTurn ? (
              <Play className="w-4 h-4 mr-2" />
            ) : (
              <Pause className="w-4 h-4 mr-2" />
            )}
            Auto Turn: {debugState.autoTurn ? "ON" : "OFF"}
          </Button>
          {!debugState.autoTurn && (
            <>
              <div className="text-xs font-mono text-gray-400 text-center mt-2">
                MANUAL NPC ACTIONS
              </div>
              <div className="space-y-2">
                <div className="text-xs font-mono text-white">Gareth (NPC1)</div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onNPCAction("npc1", "attack")}
                    className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white"
                    title="Gareth Attack"
                  >
                    <Sword className="w-3 h-3 mr-1" />
                    Attack
                  </Button>
                  <Button
                    onClick={() => onNPCAction("npc1", "defend")}
                    className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white"
                    title="Gareth Defend"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Defend
                  </Button>
                </div>
                <div className="text-xs font-mono text-white">Lyra (NPC2)</div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onNPCAction("npc2", "attack")}
                    className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white"
                    title="Lyra Attack"
                  >
                    <Sword className="w-3 h-3 mr-1" />
                    Attack
                  </Button>
                  <Button
                    onClick={() => onNPCAction("npc2", "defend")}
                    className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white"
                    title="Lyra Defend"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Defend
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
