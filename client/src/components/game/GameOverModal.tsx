import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { getGlobalMapState } from "@/lib/mapState";
import { globalHistoryManager } from "@/lib/historySystem";

interface GameOverModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon: string;
  onRestart: () => void;
}

export default function GameOverModal({ visible, title, message, icon, onRestart }: GameOverModalProps) {
  const [, setLocation] = useLocation();
  
  const handleReturnToMap = () => {
    // Determine if encounter was successful based on game outcome
    const isSuccess = title === "PEACE ACHIEVED";
    const isFlee = title === "FLED ENCOUNTER";
    
    // Reset the game state first
    onRestart();

    let result: 'success' | 'failure' | 'fled' = 'failure';
    if (isSuccess) result = 'success';
    else if (isFlee) result = 'fled';

    globalHistoryManager.completeEncounter(result);
    
    // Resolve the encounter with the appropriate result
    const mapState = getGlobalMapState();
    if (mapState.resolveEncounter && mapState.currentEncounterZone) {
      // Flee counts as failure for heat calculation
      mapState.resolveEncounter(mapState.currentEncounterZone, isSuccess && !isFlee);
    }
    
    setLocation('/map');
  };

  return (
    <Dialog open={visible}>
      <DialogContent className="bg-gray-900 border-4 border-yellow-400 max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="text-6xl">{icon}</div>
          <DialogTitle className="font-mono text-yellow-400 text-xl">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-gray-300 mb-6 text-center">{message}</p>
        <div className="text-center">
          <Button
            onClick={handleReturnToMap}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-mono py-3 px-6 transition-colors duration-200"
          >
            RETURN TO MAP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
