import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InventoryProvider, useInventoryContext } from '../hooks/InventoryProvider';

function UseItemComponent() {
  const { inventory, useItem } = useInventoryContext();
  const count = inventory.items.find(i => i.item.id === 'healing_potion')?.count || 0;
  return (
    <div>
      <span data-testid="countA">{count}</span>
      <button onClick={() => useItem('healing_potion')}>use</button>
    </div>
  );
}

function DisplayComponent() {
  const { inventory } = useInventoryContext();
  const count = inventory.items.find(i => i.item.id === 'healing_potion')?.count || 0;
  return <span data-testid="countB">{count}</span>;
}

describe('InventoryProvider', () => {
  it('shares inventory state across components', () => {
    render(
      <InventoryProvider>
        <UseItemComponent />
        <DisplayComponent />
      </InventoryProvider>
    );

    expect(screen.getByTestId('countA').textContent).toBe('3');
    expect(screen.getByTestId('countB').textContent).toBe('3');
    fireEvent.click(screen.getByText('use'));
    expect(screen.getByTestId('countA').textContent).toBe('2');
    expect(screen.getByTestId('countB').textContent).toBe('2');
  });
});
