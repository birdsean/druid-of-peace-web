import { useEffect, useRef } from "react";

interface CombatLogProps {
  entries: string[];
}

export default function CombatLog({ entries }: CombatLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="absolute bottom-4 right-4 z-30 w-56">
      <div className="bg-gray-900 bg-opacity-80 rounded-lg p-3 max-h-32 overflow-y-auto" ref={logRef}>
        <h4 className="font-mono text-gray-400 text-xs mb-2">COMBAT LOG</h4>
        <div className="space-y-1 text-xs text-gray-300">
          {entries.slice(-6).map((entry, index) => (
            <div key={index} className="log-entry">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
