import { createContext, useContext, ReactNode } from 'react';
import { useInventory } from './useInventory';

const InventoryContext = createContext<ReturnType<typeof useInventory> | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const value = useInventory();
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventoryContext() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error('useInventoryContext must be used within InventoryProvider');
  }
  return ctx;
}
