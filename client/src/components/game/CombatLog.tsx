import { useEffect, useRef } from "react";

interface CombatLogProps {
  entries: string[];
  mode: 'hidden' | 'small' | 'large';
}

export default function CombatLog({ entries, mode }: CombatLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  if (mode === 'hidden') {
    return null;
  }

  const isLarge = mode === 'large';

  return (
    <div className={
      isLarge 
        ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-3/4 bg-black bg-opacity-95 rounded-lg p-6 overflow-y-auto border-2 border-amber-400 z-50"
        : "absolute bottom-4 right-4 z-30 w-56"
    }>
      <div className={
        isLarge 
          ? "h-full" 
          : "bg-gray-900 bg-opacity-80 rounded-lg p-3 max-h-32 overflow-y-auto"
      } ref={logRef}>
        <h4 className={`font-mono text-gray-400 mb-2 ${isLarge ? 'text-xl' : 'text-xs'}`}>
          COMBAT LOG
        </h4>
        <div className={`space-y-1 text-gray-300 ${isLarge ? 'text-sm' : 'text-xs'}`}>
          {(isLarge ? entries : entries.slice(-6)).map((entry, index) => (
            <div key={index} className="log-entry">
              {entry}
            </div>
          ))}
        </div>
        {isLarge && (
          <div className="absolute top-2 right-2 text-gray-400 text-xs">
            Press LOG button to cycle modes
          </div>
        )}
      </div>
    </div>
  );
}
