import { Button } from "@/components/ui/button";

interface DruidActionPanelProps {
  visible: boolean;
  onPeaceAbility: () => void;
  onEndTurn: () => void;
  targetingMode: boolean;
}

export default function DruidActionPanel({ visible, onPeaceAbility, onEndTurn, targetingMode }: DruidActionPanelProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-4 left-4 z-30">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-4 border-2 border-green-400">
        <h3 className="font-mono text-green-400 text-sm mb-3">DRUID ACTIONS</h3>
        <div className="space-y-2">
          <Button 
            onClick={onPeaceAbility}
            disabled={targetingMode}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-mono text-xs py-2 px-4 rounded transition-colors duration-200"
          >
            🕊️ PEACE AURA
          </Button>
          <Button 
            onClick={onEndTurn}
            disabled={targetingMode}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-mono text-xs py-2 px-4 rounded transition-colors duration-200"
          >
            ⏭️ END TURN
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {targetingMode ? 'Click NPC to target' : 'Take action or end turn'}
        </div>
      </div>
    </div>
  );
}
