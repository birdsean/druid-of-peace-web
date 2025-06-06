interface TurnIndicatorProps {
  currentTurn: 'npc1' | 'npc2' | 'druid';
  turnCounter: number;
}

export default function TurnIndicator({ currentTurn, turnCounter }: TurnIndicatorProps) {
  const turnTexts = {
    'npc1': 'NPC 1 TURN',
    'npc2': 'NPC 2 TURN',
    'druid': 'DRUID TURN'
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-gray-900 bg-opacity-80 rounded-lg px-6 py-3 border-2 border-yellow-400">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse" />
          <span className="font-mono text-yellow-400 text-sm">
            {turnTexts[currentTurn]} - Round {Math.ceil(turnCounter / 3)}
          </span>
        </div>
      </div>
    </div>
  );
}
