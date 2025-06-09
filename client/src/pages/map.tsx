import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useMapState, Zone } from "@/hooks/useMapState";
import { setGlobalMapState } from "@/lib/mapState";
import NarrativeScreen from "@/components/narrative/NarrativeScreen";
import { loadNarrativeScript, type NarrativeScript } from "@/lib/narrativeLoader";
import { IS_DEBUG } from "@/lib/debug";
import { Settings, LogOut, Package } from "lucide-react";

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

function ForestZone({ zone, isCurrentZone, onClick }: { zone: Zone; isCurrentZone: boolean; onClick: () => void }) {
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
      </div>
    </div>
  );
}

function TurnCounter({ turn }: { turn: number }) {
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

export default function Map() {
  const [, setLocation] = useLocation();
  const [resolutionMode, setResolutionMode] = useState<'none' | 'success' | 'fail'>('none');
  const [narrativeScript, setNarrativeScript] = useState<NarrativeScript | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  const {
    zones,
    currentZone,
    turnCounter,
    activeEncounterZone,
    setCurrentZone,
    nextTurn,
    startEncounter,
    resolveEncounter
  } = useMapState();

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
    
    // If zone has active encounter, launch battle
    if (zone.hasEncounter) {
      startEncounter(zoneId);
      // Store the encounter zone in global state
      setGlobalMapState({ 
        resolveEncounter,
        currentEncounterZone: zoneId
      });
      setLocation('/game');
    }
  }, [currentZone, zones, setCurrentZone, startEncounter, setLocation, resolveEncounter, resolutionMode]);

  const handleNextTurn = useCallback(() => {
    nextTurn();
  }, [nextTurn]);

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
    if (confirm('Are you sure you want to exit the game?')) {
      window.location.href = '/';
    }
  }, []);

  const handleOpenInventory = useCallback(() => {
    setLocation('/inventory');
  }, [setLocation]);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-b from-green-800 via-green-600 to-green-400 overflow-hidden">
      {/* Forest Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Turn Counter */}
      <TurnCounter turn={turnCounter} />
      
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