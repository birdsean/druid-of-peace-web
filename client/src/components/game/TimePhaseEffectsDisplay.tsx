import { globalTimeManager } from '@/lib/timeSystem';

interface TimePhaseEffectsDisplayProps {
  activeEnvironmentalEffects: string[];
}

export default function TimePhaseEffectsDisplay({
  activeEnvironmentalEffects,
}: TimePhaseEffectsDisplayProps) {
  const phaseInfo = globalTimeManager.getCurrentPhaseInfo();

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 top-20 z-30">
      <div className="bg-black bg-opacity-80 rounded-lg p-3 border-2 border-amber-400 space-y-2">
        <div className="text-center">
          <div className="text-2xl">{phaseInfo.icon}</div>
          <div
            className="text-xs font-mono font-bold px-2 py-1 rounded"
            style={{
              backgroundColor: phaseInfo.colorPalette.accent + '40',
              color: phaseInfo.colorPalette.accent,
            }}
          >
            {phaseInfo.name}
          </div>
        </div>
        {activeEnvironmentalEffects.length > 0 && (
          <div className="border-t border-amber-400/30 pt-2">
            <div className="text-xs text-amber-400 font-mono mb-1">ACTIVE EFFECTS:</div>
            {activeEnvironmentalEffects.map((effectId) => (
              <div key={effectId} className="text-xs text-gray-300 font-mono">
                • {effectId.toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
