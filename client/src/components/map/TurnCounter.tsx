interface TurnCounterProps {
  turn: number;
}

export default function TurnCounter({ turn }: TurnCounterProps) {
  return (
    <div className="absolute top-4 right-4 z-30">
      <div className="bg-black bg-opacity-80 rounded-lg p-4 border-2 border-amber-400">
        <div className="text-amber-400 font-mono text-center">
          <div className="text-xs">TURN</div>
          <div className="text-2xl font-bold">{turn}</div>
        </div>
      </div>
    </div>
  );
}