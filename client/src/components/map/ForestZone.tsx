import { cn } from "@/lib/utils";
import { Zone } from "@/hooks/useMapState";
import HeatBar from "@/components/map/HeatBar";

interface ForestZoneProps {
  zone: Zone;
  isCurrentZone: boolean;
  onClick: () => void;
}

export default function ForestZone({ zone, isCurrentZone, onClick }: ForestZoneProps) {
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
      {/* Zone Icon */}
      <div className={cn(
        "relative w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl shadow-lg transition-all duration-300",
        isCurrentZone 
          ? "border-yellow-400 bg-yellow-100 shadow-yellow-400/50" 
          : "border-green-400 bg-green-100 hover:border-green-300"
      )}>
        {zone.icon}
        
        {/* Current Zone Indicator */}
        {isCurrentZone && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-xs animate-pulse">
            📍
          </div>
        )}
        
        {/* Danger Icon for Active Encounters */}
        {zone.hasEncounter && (
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-lg animate-bounce">
            ⚠️
          </div>
        )}
      </div>

      {/* Zone Label */}
      <div className="mt-2 text-center">
        <h3 className={cn(
          "font-mono font-bold text-sm shadow-lg px-2 py-1 rounded",
          isCurrentZone 
            ? "text-yellow-900 bg-yellow-200" 
            : "text-white bg-black bg-opacity-70"
        )}>
          {zone.name}
        </h3>
        
        {/* Heat Bar */}
        <div className="mt-1">
          <HeatBar heat={zone.heat} />
        </div>
        

      </div>
    </div>
  );
}