import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useMapState, Zone } from "@/hooks/useMapState";
import { setGlobalMapState } from "@/lib/mapState";
import NarrativeScreen from "@/components/narrative/NarrativeScreen";
import { loadNarrativeScript, type NarrativeScript } from "@/lib/narrativeLoader";
import { IS_DEBUG } from "@/lib/debug";
import { Settings, LogOut, Package, TreePine } from "lucide-react";
import { loadEnvironmentalEffects, EnvironmentalEffect } from "@/lib/environmentLoader";
import { globalTimeManager, type TimePhase, getTimeBasedGradient } from "@/lib/timeSystem";
import { globalWeatherManager, useWeatherState } from "@/lib/weatherSystem";
import { useMapEvents } from "@/hooks/useMapEvents";

// Inline components to avoid import issues
function HeatBar({ heat }: { heat: number }) {
  const getHeatLevel = (heat: number): string => {
    if (heat <= 10) return "None";
    if (heat <= 30) return "Cold";
    if (heat <= 50) return "Cool";
    if (heat <= 70) return "Warm";
    if (heat <= 90) return "Hot";
    return "Critical";
  };

  const getHeatColor = (heat: number): string => {
    if (heat <= 10) return "bg-blue-500";
    if (heat <= 30) return "bg-cyan-500";
    if (heat <= 50) return "bg-green-500";
    if (heat <= 70) return "bg-yellow-500";
    if (heat <= 90) return "bg-orange-500";
    return "bg-red-500";
  };

  const level = getHeatLevel(heat);
  const colorClass = getHeatColor(heat);
  
  return (
    <div 
      className="relative group"
      title={`Heat: ${heat} – ${level}. Higher heat makes conflict more likely.`}
    >
      <div className="w-16 h-2 bg-gray-300 rounded-full border border-gray-400">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClass,
            heat >= 90 && "animate-pulse"
          )}
          style={{ width: `${heat}%` }}
        />
      </div>
      <div className="text-xs text-white font-mono text-center mt-1 bg-black bg-opacity-70 rounded px-1">
        {heat}
      </div>
    </div>
  );
}

function ForestZone({ zone, isCurrentZone, onClick, environmentEffect }: { 
  zone: Zone; 
  isCurrentZone: boolean; 
  onClick: () => void;
  environmentEffect?: EnvironmentalEffect;
}) {
  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20",
        isCurrentZone ? "scale-110" : "hover:scale-105"
      )}
      style={{
        left: `${zone.position.x}%`,
        top: `${zone.position.y}%`
      }}
      onClick={onClick}
    >
      <div className={cn(
        "relative w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl shadow-lg transition-all duration-300",
        isCurrentZone 
          ? "border-yellow-400 bg-yellow-100 shadow-yellow-400/50" 
          : "border-green-400 bg-green-100 hover:border-green-300"
      )}>
        {zone.icon}
        
        {isCurrentZone && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-xs animate-pulse">
            📍
          </div>
        )}
        
        {zone.hasEncounter && (
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-lg animate-bounce">
            ⚠️
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        <h3 className={cn(
          "font-mono font-bold text-sm shadow-lg px-2 py-1 rounded",
          isCurrentZone 
            ? "text-yellow-900 bg-yellow-200" 
            : "text-white bg-black bg-opacity-70"
        )}>
          {zone.name}
        </h3>
        
        <div className="mt-1">
          <HeatBar heat={zone.heat} />
        </div>
        
        {/* Environmental Effect Indicator */}
        {environmentEffect && (
          <div 
            className="mt-1 flex justify-center"
            title={`${environmentEffect.name}: ${environmentEffect.description}`}
          >
            <div 
              className="px-2 py-1 rounded-full text-xs font-mono border-2 cursor-help transition-all duration-200 hover:scale-110"
              style={{ 
                backgroundColor: environmentEffect.color + '40',
                borderColor: environmentEffect.color,
                color: environmentEffect.color
              }}
            >
              <span className="mr-1">{environmentEffect.icon}</span>
              <span className="text-white bg-black bg-opacity-70 px-1 rounded">
                {environmentEffect.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TurnCounter({ turn, timePhase, weatherState }: { 
  turn: number; 
  timePhase: TimePhase; 
  weatherState: any;
}) {
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

        {/* Weather Display */}
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

export default function Map() {
  const [, setLocation] = useLocation();
  const [resolutionMode, setResolutionMode] = useState<'none' | 'success' | 'fail'>('none');
  const [narrativeScript, setNarrativeScript] = useState<NarrativeScript | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  const [environmentalEffects, setEnvironmentalEffects] = useState<Record<string, EnvironmentalEffect>>({});
  const weatherState = useWeatherState();
  const {
    zones,
    currentZone,
    turnCounter,
    activeEncounterZone,
    currentTimePhase,
    setCurrentZone,
    nextTurn,
    startEncounter,
    resolveEncounter
  } = useMapState();

  const {
    logTurnAdvance,
    logEncounterStart,
    logEncounterComplete,
    logZoneChange,
    getEventLog
  } = useMapEvents();

  // Load environmental effects and weather data
  useEffect(() => {
    const loadEffects = async () => {
      try {
        const effectsData = await loadEnvironmentalEffects();
        if (effectsData) {
          setEnvironmentalEffects(effectsData.environmentalEffects);
        }
      } catch (error) {
        console.error('Failed to load environmental effects:', error);
      }
    };
    
    const loadWeather = async () => {
      await globalWeatherManager.loadWeatherData();
    };
    
    loadEffects();
    loadWeather();
  }, []);

  // Set global map state for encounter resolution
  useEffect(() => {
    setGlobalMapState({ 
      resolveEncounter,
      currentEncounterZone: activeEncounterZone || undefined
    });
  }, [resolveEncounter, activeEncounterZone]);

  const handleZoneClick = useCallback((zoneId: string) => {
    // Handle debug resolution modes
    if (resolutionMode !== 'none') {
      const isSuccess = resolutionMode === 'success';
      resolveEncounter(zoneId, isSuccess);
      setResolutionMode('none');
      return;
    }

    if (currentZone === zoneId) return; // Re-clicking current zone does nothing
    
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    setCurrentZone(zoneId);
    logZoneChange(turnCounter, zoneId, zone.name);
    
    // If zone has active encounter, launch battle
    if (zone.hasEncounter) {
      startEncounter(zoneId);
      logEncounterStart(turnCounter, zoneId, zone.name);
      // Store the encounter zone in global state
      setGlobalMapState({ 
        resolveEncounter,
        currentEncounterZone: zoneId
      });
      setLocation('/game');
    }
  }, [currentZone, zones, setCurrentZone, startEncounter, setLocation, resolveEncounter, resolutionMode, logZoneChange, logEncounterStart, turnCounter]);

  const handleNextTurn = useCallback(() => {
    const newTurn = turnCounter + 1;
    nextTurn();
    logTurnAdvance(newTurn);
  }, [nextTurn, turnCounter, logTurnAdvance]);

  const handleNarrativeStart = useCallback((scriptId: string) => {
    const script = loadNarrativeScript(scriptId);
    if (script) {
      setNarrativeScript(script);
    }
  }, []);

  const handleNarrativeComplete = useCallback(() => {
    setNarrativeScript(null);
  }, []);

  const handleNarrativeChoice = useCallback((choiceId: string, pageId: string) => {
    console.log(`Choice made: ${choiceId} on page ${pageId}`);
  }, []);

  const handleExitGame = useCallback(() => {
    if (confirm('Return to main menu?')) {
      setLocation('/');
    }
  }, [setLocation]);

  const handleOpenInventory = useCallback(() => {
    setLocation('/inventory');
  }, [setLocation]);

  const handleOpenSkills = useCallback(() => {
    setLocation('/skills');
  }, [setLocation]);

  return (
    <div className={`relative w-screen h-screen ${getTimeBasedGradient(currentTimePhase)} overflow-hidden`}>
      
      {/* Debug Panel - Map Screen */}
      {IS_DEBUG && (
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
                {/* Progress Turn */}
                <Button
                  onClick={handleNextTurn}
                  className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white font-mono"
                >
                  PROGRESS TURN
                </Button>
                
                {/* Resolve Success */}
                <Button
                  onClick={() => setResolutionMode(resolutionMode === 'success' ? 'none' : 'success')}
                  className={cn(
                    "w-full h-8 text-xs font-mono border-2 transition-all duration-200",
                    resolutionMode === 'success' 
                      ? 'bg-green-700 border-green-500 text-white' 
                      : 'bg-green-600 hover:bg-green-700 border-green-400 text-white'
                  )}
                >
                  {resolutionMode === 'success' ? 'CLICK ZONE (SUCCESS)' : 'RESOLVE SUCCESS'}
                </Button>
                
                {/* Resolve Fail */}
                <Button
                  onClick={() => setResolutionMode(resolutionMode === 'fail' ? 'none' : 'fail')}
                  className={cn(
                    "w-full h-8 text-xs font-mono border-2 transition-all duration-200",
                    resolutionMode === 'fail' 
                      ? 'bg-red-700 border-red-500 text-white' 
                      : 'bg-red-600 hover:bg-red-700 border-red-400 text-white'
                  )}
                >
                  {resolutionMode === 'fail' ? 'CLICK ZONE (FAIL)' : 'RESOLVE FAIL'}
                </Button>
                
                {/* Story Intro */}
                <Button
                  onClick={() => handleNarrativeStart('introduction')}
                  className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 text-white font-mono"
                >
                  STORY INTRO
                </Button>

                {/* Time Management Debug Tools */}
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
                            "w-8 h-6 text-xs border-1 p-0",
                            currentTimePhase === phase 
                              ? "bg-yellow-600 border-yellow-400" 
                              : "bg-gray-700 hover:bg-gray-600 border-gray-500"
                          )}
                          title={globalTimeManager.getPhaseInfo(phase).name}
                        >
                          {globalTimeManager.getPhaseInfo(phase).icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weather Debug Controls */}
                <div className="mt-2 p-2 bg-black/50 rounded border border-gray-600">
                  <p className="text-xs text-cyan-300 mb-2 font-mono">WEATHER CONTROLS:</p>
                  <div className="space-y-2">
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        onClick={() => globalWeatherManager.debugTriggerWeather('gentle_rain', turnCounter)}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700"
                      >
                        🌧️ Rain
                      </Button>
                      <Button
                        onClick={() => globalWeatherManager.debugTriggerWeather('morning_mist', turnCounter)}
                        className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700"
                      >
                        🌫️ Mist
                      </Button>
                      <Button
                        onClick={() => globalWeatherManager.debugTriggerWeather('forest_wind', turnCounter)}
                        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700"
                      >
                        💨 Wind
                      </Button>
                      <Button
                        onClick={() => globalWeatherManager.debugTriggerWeather('sunbeam_clearing', turnCounter)}
                        className="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700"
                      >
                        ☀️ Sun
                      </Button>
                      <Button
                        onClick={() => globalWeatherManager.debugClearWeather(turnCounter)}
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

                {/* Map Event Log */}
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
      )}

      {/* Turn Counter */}
      <TurnCounter turn={turnCounter} timePhase={currentTimePhase} weatherState={weatherState} />
      
      {/* Map Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <h1 className="text-4xl font-bold text-white font-mono shadow-lg">
          🌲 FOREST OF ECHOES 🌲
        </h1>
        <p className="text-center text-green-200 mt-2 font-mono">
          Current Location: {zones.find(z => z.id === currentZone)?.name || "Unknown"}
        </p>
      </div>

      {/* Forest Zones */}
      <div className="relative w-full h-full">
        {zones.map((zone) => (
          <ForestZone
            key={zone.id}
            zone={zone}
            isCurrentZone={currentZone === zone.id}
            onClick={() => handleZoneClick(zone.id)}
            environmentEffect={zone.environmentEffect ? environmentalEffects[zone.environmentEffect] : undefined}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-30 bg-black bg-opacity-80 rounded-lg p-4 text-white font-mono text-sm">
        <h3 className="font-bold mb-2">Heat Levels:</h3>
        <div className="space-y-1">
          <div className="text-blue-300">0-10: None</div>
          <div className="text-cyan-300">11-30: Cold</div>
          <div className="text-green-300">31-50: Cool</div>
          <div className="text-yellow-300">51-70: Warm</div>
          <div className="text-orange-300">71-90: Hot</div>
          <div className="text-red-300">91-100: Critical</div>
        </div>
      </div>

      {/* Bottom Panel - Right Side */}
      <div className="absolute bottom-0 right-0 z-30">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            {/* Skills Button */}
            <Button
              onClick={handleOpenSkills}
              className="w-12 h-12 bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 text-white"
              title="Open Skills"
            >
              <TreePine className="w-5 h-5" />
            </Button>

            {/* Inventory Button */}
            <Button
              onClick={handleOpenInventory}
              className="w-12 h-12 bg-amber-600 hover:bg-amber-700 border-2 border-amber-400 text-white"
              title="Open Inventory"
            >
              <Package className="w-5 h-5" />
            </Button>

            {/* Exit Game Button */}
            <Button
              onClick={handleExitGame}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white"
              title="Exit Game"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Narrative Screen Overlay */}
      {narrativeScript && (
        <NarrativeScreen
          script={narrativeScript}
          onComplete={handleNarrativeComplete}
          onChoice={handleNarrativeChoice}
        />
      )}
    </div>
  );
}