import { globalTimeManager, type TimePhase } from "@/lib/timeSystem";

interface TurnCounterProps {
  turn: number;
  timePhase: TimePhase;
  weatherState: any;
}

export default function TurnCounter({ turn, timePhase, weatherState }: TurnCounterProps) {
  const phaseInfo = globalTimeManager.getPhaseInfo(timePhase);

  return (
    <div className="absolute top-4 right-4 z-30">
      <div className="bg-black bg-opacity-80 rounded-lg p-4 border-2 border-amber-400 space-y-2">
        <div className="text-amber-400 font-mono text-center">
          <div className="text-xs">TURN</div>
          <div className="text-2xl font-bold">{turn}</div>
        </div>

        <div className="text-center border-t border-amber-400/30 pt-2">
          <div className="text-3xl mb-1">{phaseInfo.icon}</div>
          <div
            className="text-xs font-mono font-bold px-2 py-1 rounded"
            style={{
              backgroundColor: phaseInfo.colorPalette.accent + '40',
              color: phaseInfo.colorPalette.accent,
              borderColor: phaseInfo.colorPalette.accent
            }}
          >
            {phaseInfo.name}
          </div>
        </div>

        {weatherState?.activeWeather && (
          <div className="text-center border-t border-amber-400/30 pt-2">
            <div
              className="text-2xl mb-1"
              title={weatherState.activeWeather.effect.description}
            >
              {weatherState.activeWeather.effect.icon}
            </div>
            <div className="text-xs text-cyan-300 font-mono font-bold">
              {weatherState.activeWeather.effect.name}
            </div>
            <div className="text-xs text-cyan-400 font-mono">
              {weatherState.activeWeather.remainingTurns} turns left
            </div>
          </div>
        )}
      </div>
    </div>
  );
}