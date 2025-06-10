import { describe, it, expect } from 'vitest';
import { loadItems, getItemById } from '../lib/inventory';
import type { Item } from '../lib/inventory';

describe('Inventory System', () => {
  describe('loadItems', () => {
    it('should load and return array of items', () => {
      const items = loadItems();
      
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      
      // Verify item structure
      items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('effects');
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.description).toBe('string');
        expect(typeof item.icon).toBe('string');
        expect(item.type).toBe('consumable');
      });
    });

    it('should include healing potion with correct properties', () => {
      const items = loadItems();
      const healingPotion = items.find(item => item.id === 'healing_potion');
      
      expect(healingPotion).toBeDefined();
      expect(healingPotion?.name).toBe('Healing Potion');
      expect(healingPotion?.effects.heal).toBeGreaterThan(0);
    });

    it('should include calming herbs with correct properties', () => {
      const items = loadItems();
      const calmingHerbs = items.find(item => item.id === 'calming_herbs');
      
      expect(calmingHerbs).toBeDefined();
      expect(calmingHerbs?.name).toBe('Calming Herbs');
      expect(calmingHerbs?.effects.reduceWill).toBeGreaterThan(0);
    });

    it('should include energy crystal with correct properties', () => {
      const items = loadItems();
      const energyCrystal = items.find(item => item.id === 'energy_crystal');
      
      expect(energyCrystal).toBeDefined();
      expect(energyCrystal?.name).toBe('Energy Crystal');
      expect(energyCrystal?.effects.restoreAP).toBeGreaterThan(0);
    });
  });

  describe('getItemById', () => {
    it('should return item when valid ID is provided', () => {
      const item = getItemById('healing_potion');
      
      expect(item).toBeDefined();
      expect(item?.id).toBe('healing_potion');
      expect(item?.name).toBe('Healing Potion');
    });

    it('should return undefined for invalid ID', () => {
      const item = getItemById('nonexistent_item');
      
      expect(item).toBeUndefined();
    });

    it('should return undefined for empty ID', () => {
      const item = getItemById('');
      
      expect(item).toBeUndefined();
    });

    it('should handle all available items', () => {
      const items = loadItems();
      
      items.forEach(expectedItem => {
        const foundItem = getItemById(expectedItem.id);
        expect(foundItem).toBeDefined();
        expect(foundItem?.id).toBe(expectedItem.id);
        expect(foundItem?.name).toBe(expectedItem.name);
      });
    });
  });

  describe('Item Effects', () => {
    it('should have valid effect structures', () => {
      const items = loadItems();
      
      items.forEach(item => {
        const effects = item.effects;
        
        // At least one effect should be present
        const hasEffect = effects.heal || effects.reduceAwareness || 
                          effects.reduceWill || effects.restoreAP || effects.targetAll;
        expect(hasEffect).toBeTruthy();
        
        // Numeric effects should be positive
        if (effects.heal) expect(effects.heal).toBeGreaterThan(0);
        if (effects.reduceAwareness) expect(effects.reduceAwareness).toBeGreaterThan(0);
        if (effects.reduceWill) expect(effects.reduceWill).toBeGreaterThan(0);
        if (effects.restoreAP) expect(effects.restoreAP).toBeGreaterThan(0);
        
        // targetAll should be boolean if present
        if (effects.targetAll !== undefined) {
          expect(typeof effects.targetAll).toBe('boolean');
        }
      });
    });

    it('should have calming herbs with area effect', () => {
      const items = loadItems();
      const calmingHerbs = items.find(item => item.id === 'calming_herbs');
      
      expect(calmingHerbs).toBeDefined();
      expect(calmingHerbs?.effects.targetAll).toBe(true);
      expect(calmingHerbs?.effects.reduceWill).toBeGreaterThan(0);
    });
  });
});