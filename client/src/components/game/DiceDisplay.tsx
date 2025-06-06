import { useEffect, useState } from "react";

interface DiceDisplayProps {
  visible: boolean;
  result: number | null;
  effect: string;
  rolling: boolean;
}

export default function DiceDisplay({ visible, result, effect, rolling }: DiceDisplayProps) {
  const [animationValue, setAnimationValue] = useState(1);

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setAnimationValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [rolling]);

  if (!visible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
      <div className="bg-gray-900 bg-opacity-95 rounded-lg p-6 border-2 border-yellow-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl font-mono">
            {rolling ? animationValue : result || '🎲'}
          </div>
          <div className="font-mono text-yellow-400 text-lg">
            {rolling ? 'Rolling...' : `Rolled: ${result}`}
          </div>
          <div className="text-sm text-gray-300 mt-2">
            {effect}
          </div>
        </div>
      </div>
    </div>
  );
}
