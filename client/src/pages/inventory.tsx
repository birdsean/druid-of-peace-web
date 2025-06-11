import InventoryScreen from "@/components/inventory/InventoryScreen";
import { InventoryProvider } from "@/hooks/InventoryProvider";

export default function Inventory() {
  return (
    <InventoryProvider>
      <InventoryScreen />
    </InventoryProvider>
  );
}