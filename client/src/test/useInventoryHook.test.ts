import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInventory } from '../hooks/useInventory';

// Tests for useInventory hook

describe('useInventory hook', () => {
  it('addItem adds new items and increments counts', () => {
    const { result } = renderHook(() => useInventory());

    // Increment existing item
    act(() => {
      result.current.addItem('healing_potion');
    });
    expect(result.current.getItemCount('healing_potion')).toBe(4);

    // Add brand new item
    act(() => {
      result.current.addItem('distraction_stone');
    });
    expect(result.current.getItemCount('distraction_stone')).toBe(1);
  });

  it('useItem decrements and removes items', () => {
    const { result } = renderHook(() => useInventory());

    // Use item until removed
    act(() => {
      result.current.useItem('healing_potion');
      result.current.useItem('healing_potion');
      result.current.useItem('healing_potion');
    });

    expect(result.current.getItemCount('healing_potion')).toBe(0);
    const stillExists = result.current.inventory.items.find(i => i.item.id === 'healing_potion');
    expect(stillExists).toBeUndefined();

    // Using non-existent item returns false
    let success = true;
    act(() => {
      success = result.current.useItem('fake_item');
    });
    expect(success).toBe(false);
  });
});
