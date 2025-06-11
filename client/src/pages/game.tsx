import GameBoard from "@/components/game/GameBoard";
import { InventoryProvider } from "@/hooks/InventoryProvider";

export default function Game() {
  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      <InventoryProvider>
        <GameBoard />
      </InventoryProvider>
    </div>
  );
}
