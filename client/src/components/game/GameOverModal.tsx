import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getGlobalMapState } from "@/lib/mapState";

interface GameOverModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon: string;
  onRestart: () => void;
}

export default function GameOverModal({ visible, title, message, icon, onRestart }: GameOverModalProps) {
  const [, setLocation] = useLocation();
  
  if (!visible) return null;

  const handleReturnToMap = () => {
    // Determine if encounter was successful based on game outcome
    const isSuccess = title === "PEACE ACHIEVED";
    const isFlee = title === "FLED ENCOUNTER";
    
    // Reset the game state first
    onRestart();
    
    // Resolve the encounter with the appropriate result
    const mapState = getGlobalMapState();
    if (mapState.resolveEncounter && mapState.currentEncounterZone) {
      // Flee counts as failure for heat calculation
      mapState.resolveEncounter(mapState.currentEncounterZone, isSuccess && !isFlee);
    }
    
    setLocation('/');
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-8 border-4 border-yellow-400 max-w-md">
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="font-mono text-yellow-400 text-xl mb-4">{title}</h2>
          <p className="text-gray-300 mb-6">{message}</p>
          <Button 
            onClick={handleReturnToMap}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-mono py-3 px-6 rounded transition-colors duration-200"
          >
            RETURN TO MAP
          </Button>
        </div>
      </div>
    </div>
  );
}
