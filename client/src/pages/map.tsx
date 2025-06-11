import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useMapState } from "@/hooks/useMapState";
import { setGlobalMapState } from "@/lib/mapState";
import NarrativeScreen from "@/components/narrative/NarrativeScreen";
import { loadNarrativeScript, type NarrativeScript } from "@/lib/narrativeLoader";
import { IS_DEBUG } from "@/lib/debug";
import ForestZone from "@/components/map/ForestZone";
import TurnCounter from "@/components/map/TurnCounter";
import MapDebugPanel from "@/components/map/MapDebugPanel";
import { loadEnvironmentalEffects, EnvironmentalEffect } from "@/lib/environmentLoader";
import { globalTimeManager, type TimePhase, getTimeBasedGradient, getTimeBasedEnvironmentalEffect } from "@/lib/timeSystem";
import { globalWeatherManager, useWeatherState } from "@/lib/weatherSystem";
import { useMapEvents } from "@/hooks/useMapEvents";
import PlayerActionPanel from "@/components/game/PlayerActionPanel";
import { globalHistoryManager } from "@/lib/historySystem";


export default function Map() {
  const [, setLocation] = useLocation();
  const [resolutionMode, setResolutionMode] = useState<'none' | 'success' | 'fail'>('none');
  const [narrativeScript, setNarrativeScript] = useState<NarrativeScript | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  const [environmentalEffects, setEnvironmentalEffects] = useState<Record<string, EnvironmentalEffect>>({});
  const weatherState = useWeatherState();

  // Temporary player action state for map interactions
  const [actionPoints, setActionPoints] = useState(3);
  const maxActionPoints = 3;
  const [combatLogMode, setCombatLogMode] = useState<'hidden' | 'small' | 'large'>('hidden');
  const {
    zones,
    currentZone,
    turnCounter,
    activeEncounterZone,
    activeWeatherEffect,
    currentTimePhase,
    setCurrentZone,
    nextTurn,
    startEncounter,
    resolveEncounter
  } = useMapState();

  const {
    addMapEvent,
    logTurnAdvance,
    logEncounterStart,
    logEncounterComplete,
    logEncounterGenerated,
    logZoneChange,
    logWeatherChange,
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
      currentEncounterZone: activeEncounterZone || undefined,
      activeWeatherEffect
    });
  }, [resolveEncounter, activeEncounterZone, activeWeatherEffect]);

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
      const weatherEffect = globalWeatherManager.getActiveEnvironmentalEffect();
      startEncounter(zoneId, weatherEffect);

      const timeEffect = getTimeBasedEnvironmentalEffect(currentTimePhase);
      const envEffects = [timeEffect.id];
      if (zone.environmentEffect) {
        envEffects.push(zone.environmentEffect);
      }
      globalHistoryManager.startEncounter(
        zoneId,
        zone.name,
        turnCounter,
        envEffects,
        weatherEffect || undefined,
        currentTimePhase
      );

      logEncounterStart(turnCounter, zoneId, zone.name);
      // Store the encounter zone in global state
      setGlobalMapState({
        resolveEncounter,
        currentEncounterZone: zoneId,
        activeWeatherEffect: weatherEffect
      });
      setLocation('/game');
    }
  }, [currentZone, zones, setCurrentZone, startEncounter, setLocation, resolveEncounter, resolutionMode, logZoneChange, logEncounterStart, turnCounter, currentTimePhase]);

  const handleNextTurn = useCallback(() => {
    const newTurn = turnCounter + 1;
    const previousPhase = currentTimePhase;
    
    // Advance turn (this also advances time phase internally)
    nextTurn();
    
    // Get the updated phase from global time manager
    const nextTimePhase = globalTimeManager.getState();
    
    // Check for weather events with the new turn number
    const weatherChanged = globalWeatherManager.checkForWeatherTrigger(newTurn);
    
    logTurnAdvance(newTurn);

    // Log day cycle change event if phase changed
    if (previousPhase !== nextTimePhase.currentPhase) {
      const phaseEvent = {
        id: `phase-${Date.now()}`,
        timestamp: Date.now(),
        turn: newTurn,
        type: 'travel' as const,
        details: `Day cycle: ${previousPhase} → ${nextTimePhase.currentPhase}`
      };
      addMapEvent(phaseEvent);
    }

    // Log weather event if weather changed
    if (weatherChanged) {
      const activeWeather = globalWeatherManager.getWeatherState().activeWeather;
      logWeatherChange(
        newTurn,
        activeWeather
          ? `Weather: ${activeWeather.effect.name} (${activeWeather.remainingTurns} turns)`
          : 'Weather cleared'
      );
    }
  }, [nextTurn, turnCounter, logTurnAdvance, currentTimePhase, addMapEvent, logWeatherChange]);

  const handleNarrativeStart = useCallback(async (scriptId: string) => {
    const script = await loadNarrativeScript(scriptId);
    if (script) {
      setNarrativeScript(script);
    }
  }, []);

  const handleNarrativeComplete = useCallback(() => {
    setNarrativeScript(null);
  }, []);

  const handleNarrativeChoice = useCallback((choiceId: string, pageId: string) => {
    const choiceEvent = {
      id: `choice-${Date.now()}`,
      timestamp: Date.now(),
      turn: turnCounter,
      type: 'travel' as const,
      details: `Story choice: ${choiceId} on ${pageId}`
    };
    addMapEvent(choiceEvent);
  }, [turnCounter, addMapEvent]);

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

  const handleAbilityUse = useCallback((abilityKey: string) => {
    if (actionPoints <= 0) return;
    setActionPoints(ap => Math.max(ap - 1, 0));
    console.log('Used ability', abilityKey);
  }, [actionPoints]);

  const handleEndTurn = useCallback(() => {
    setActionPoints(maxActionPoints);
    handleNextTurn();
  }, [handleNextTurn]);

  const handleToggleCombatLog = useCallback(() => {
    setCombatLogMode(prev => prev === 'hidden' ? 'small' : prev === 'small' ? 'large' : 'hidden');
  }, []);

  const handleCancelAction = useCallback(() => {
    /* no-op for now */
  }, []);

  return (
    <div className={`relative w-screen h-screen ${getTimeBasedGradient(currentTimePhase)} overflow-hidden`}>
      {IS_DEBUG && (
        <MapDebugPanel
          showDebugPanel={showDebugPanel}
          setShowDebugPanel={setShowDebugPanel}
          resolutionMode={resolutionMode}
          setResolutionMode={setResolutionMode}
          handleNextTurn={handleNextTurn}
          handleNarrativeStart={handleNarrativeStart}
          currentTimePhase={currentTimePhase}
          weatherState={weatherState}
          turnCounter={turnCounter}
          getEventLog={getEventLog}
          logWeatherChange={logWeatherChange}
        />
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


      {/* Player Action Panel */}
      <PlayerActionPanel
        actionPoints={actionPoints}
        maxActionPoints={maxActionPoints}
        targetingMode={false}
        abilities={[]}
        onAbilityUse={handleAbilityUse}
        onEndTurn={handleEndTurn}
        onOpenInventory={handleOpenInventory}
        onOpenSkills={handleOpenSkills}
        onExitGame={handleExitGame}
        onToggleCombatLog={handleToggleCombatLog}
        combatLogMode={combatLogMode}
        isPlayerTurn={true}
        onCancelAction={handleCancelAction}
      />

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
