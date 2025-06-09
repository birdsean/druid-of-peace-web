import { useState, useCallback } from 'react';
import { InventoryState, InventoryItem, Item, loadItems } from '@/lib/inventory';

const initialInventory: InventoryState = {
  items: [
    { item: loadItems().find(i => i.id === 'healing_potion')!, count: 3 },
    { item: loadItems().find(i => i.id === 'smoke_bomb')!, count: 2 },
    { item: loadItems().find(i => i.id === 'energy_crystal')!, count: 1 }
  ]
};

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryState>(initialInventory);

  const addItem = useCallback((itemId: string, count: number = 1) => {
    const allItems = loadItems();
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    setInventory(prev => {
      const existingIndex = prev.items.findIndex(inv => inv.item.id === itemId);
      
      if (existingIndex >= 0) {
        // Item exists, increase count
        const newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          count: newItems[existingIndex].count + count
        };
        return { ...prev, items: newItems };
      } else {
        // New item
        return {
          ...prev,
          items: [...prev.items, { item, count }]
        };
      }
    });
  }, []);

  const useItem = useCallback((itemId: string): boolean => {
    const itemIndex = inventory.items.findIndex(inv => inv.item.id === itemId);
    if (itemIndex === -1 || inventory.items[itemIndex].count <= 0) {
      return false;
    }

    setInventory(prev => {
      const newItems = [...prev.items];
      if (newItems[itemIndex].count === 1) {
        // Remove item if count reaches 0
        newItems.splice(itemIndex, 1);
      } else {
        // Decrease count
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          count: newItems[itemIndex].count - 1
        };
      }
      return { ...prev, items: newItems };
    });

    return true;
  }, [inventory.items]);

  const getItemCount = useCallback((itemId: string): number => {
    const item = inventory.items.find(inv => inv.item.id === itemId);
    return item?.count || 0;
  }, [inventory.items]);

  return {
    inventory,
    addItem,
    useItem,
    getItemCount
  };
}