import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { globalTimeManager, type TimePhase } from "@/lib/timeSystem";
import { globalWeatherManager } from "@/lib/weatherSystem";
interface MapDebugPanelProps {
  showDebugPanel: boolean;
  setShowDebugPanel: (value: boolean) => void;
  resolutionMode: "none" | "success" | "fail";
  setResolutionMode: (mode: "none" | "success" | "fail") => void;
  handleNextTurn: () => void;
  handleNarrativeStart: (scriptId: string) => void;
  currentTimePhase: TimePhase;
  weatherState: any;
  turnCounter: number;
  getEventLog: () => string[];
  logWeatherChange: (turn: number, details: string) => void;
}

export default function MapDebugPanel({
  showDebugPanel,
  setShowDebugPanel,
  resolutionMode,
  setResolutionMode,
  handleNextTurn,
  handleNarrativeStart,
  currentTimePhase,
  weatherState,
  turnCounter,
  getEventLog,
  logWeatherChange
}: MapDebugPanelProps) {
  return (
    <div className="absolute top-4 left-4 z-40">
      <div className="bg-gray-900 rounded-lg p-3 shadow-lg border-2 border-yellow-400">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono text-yellow-400">DEBUG</div>
          <Button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="w-6 h-6 p-0 bg-yellow-600 hover:bg-yellow-700 text-white"
            title="Toggle debug panel"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        {showDebugPanel && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleNextTurn}
              className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white font-mono"
            >
              PROGRESS TURN
            </Button>

            <Button
              onClick={() => setResolutionMode(resolutionMode === 'success' ? 'none' : 'success')}
              className={cn(
                'w-full h-8 text-xs font-mono border-2 transition-all duration-200',
                resolutionMode === 'success'
                  ? 'bg-green-700 border-green-500 text-white'
                  : 'bg-green-600 hover:bg-green-700 border-green-400 text-white'
              )}
            >
              {resolutionMode === 'success' ? 'CLICK ZONE (SUCCESS)' : 'RESOLVE SUCCESS'}
            </Button>

            <Button
              onClick={() => setResolutionMode(resolutionMode === 'fail' ? 'none' : 'fail')}
              className={cn(
                'w-full h-8 text-xs font-mono border-2 transition-all duration-200',
                resolutionMode === 'fail'
                  ? 'bg-red-700 border-red-500 text-white'
                  : 'bg-red-600 hover:bg-red-700 border-red-400 text-white'
              )}
            >
              {resolutionMode === 'fail' ? 'CLICK ZONE (FAIL)' : 'RESOLVE FAIL'}
            </Button>

            <Button
              onClick={() => handleNarrativeStart('introduction')}
              className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 text-white font-mono"
            >
              STORY INTRO
            </Button>

            <div className="mt-2 p-2 bg-black/50 rounded border border-gray-600">
              <p className="text-xs text-gray-300 mb-2 font-mono">TIME DEBUG:</p>
              <div className="space-y-1">
                <div className="text-xs text-gray-300 font-mono">
                  Current: {globalTimeManager.getCurrentPhaseInfo().name} {globalTimeManager.getCurrentPhaseInfo().icon}
                </div>
                <div className="flex gap-1">
                  {globalTimeManager.getAllPhases().map((phase) => (
                    <Button
                      key={phase}
                      onClick={() => globalTimeManager.setPhase(phase)}
                      className={cn(
                        'w-8 h-6 text-xs border-1 p-0',
                        currentTimePhase === phase
                          ? 'bg-yellow-600 border-yellow-400'
                          : 'bg-gray-700 hover:bg-gray-600 border-gray-500'
                      )}
                      title={globalTimeManager.getPhaseInfo(phase).name}
                    >
                      {globalTimeManager.getPhaseInfo(phase).icon}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 p-2 bg-black/50 rounded border border-gray-600">
              <p className="text-xs text-cyan-300 mb-2 font-mono">WEATHER CONTROLS:</p>
              <div className="space-y-2">
                <div className="flex gap-1 flex-wrap">
                  <Button
                    onClick={() => {
                      globalWeatherManager.debugTriggerWeather('gentle_rain', turnCounter);
                      logWeatherChange(turnCounter, 'Weather: Gentle Rain');
                    }}
                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700"
                  >
                    🌧️ Rain
                  </Button>
                  <Button
                    onClick={() => {
                      globalWeatherManager.debugTriggerWeather('morning_mist', turnCounter);
                      logWeatherChange(turnCounter, 'Weather: Morning Mist');
                    }}
                    className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700"
                  >
                    🌫️ Mist
                  </Button>
                  <Button
                    onClick={() => {
                      globalWeatherManager.debugTriggerWeather('forest_wind', turnCounter);
                      logWeatherChange(turnCounter, 'Weather: Forest Wind');
                    }}
                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700"
                  >
                    💨 Wind
                  </Button>
                  <Button
                    onClick={() => {
                      globalWeatherManager.debugTriggerWeather('sunbeam_clearing', turnCounter);
                      logWeatherChange(turnCounter, 'Weather: Sunbeam Clearing');
                    }}
                    className="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700"
                  >
                    ☀️ Sun
                  </Button>
                  <Button
                    onClick={() => {
                      globalWeatherManager.debugClearWeather(turnCounter);
                      logWeatherChange(turnCounter, 'Weather cleared');
                    }}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700"
                  >
                    Clear
                  </Button>
                </div>
                {weatherState?.activeWeather && (
                  <div className="text-xs text-cyan-400 font-mono">
                    Active: {weatherState.activeWeather.effect.name} ({weatherState.activeWeather.remainingTurns} turns)
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2 p-2 bg-black/50 rounded border border-gray-600">
              <p className="text-xs text-gray-300 mb-1 font-mono">MAP EVENT LOG:</p>
              <div className="h-24 overflow-y-auto">
                <div className="text-xs text-gray-300 space-y-1 font-mono">
                  {getEventLog().length === 0 ? (
                    <p className="text-gray-500">No events yet</p>
                  ) : (
                    getEventLog().slice(-8).map((log, index) => (
                      <div key={index} className="text-xs">{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
