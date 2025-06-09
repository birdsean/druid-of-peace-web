import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import ForestZone from "@/components/map/ForestZone";
import TurnCounter from "@/components/map/TurnCounter";
import { useMapState } from "@/hooks/useMapState";

export default function Map() {
  const [, setLocation] = useLocation();
  const {
    zones,
    currentZone,
    turnCounter,
    setCurrentZone,
    nextTurn,
    startEncounter
  } = useMapState();

  const handleZoneClick = useCallback((zoneId: string) => {
    if (currentZone === zoneId) return; // Re-clicking current zone does nothing
    
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    setCurrentZone(zoneId);
    
    // If zone has active encounter, launch battle
    if (zone.hasEncounter) {
      startEncounter(zoneId);
      setLocation('/game');
    }
  }, [currentZone, zones, setCurrentZone, startEncounter, setLocation]);

  const handleNextTurn = useCallback(() => {
    nextTurn();
  }, [nextTurn]);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-b from-green-800 via-green-600 to-green-400 overflow-hidden">
      {/* Forest Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      
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

      {/* Next Turn Button */}
      <div className="absolute bottom-4 right-4 z-30">
        <Button
          onClick={handleNextTurn}
          className="w-32 h-12 bg-amber-600 hover:bg-amber-700 border-2 border-amber-400 text-white font-mono text-lg shadow-lg"
        >
          ⏰ Next Turn
        </Button>
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
    </div>
  );
}