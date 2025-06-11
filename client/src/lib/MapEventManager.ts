export class MapEventManager {
  private events: import('./events').MapEvent[] = [];
  private listeners: Array<(events: import('./events').MapEvent[]) => void> = [];

  addEvent(event: import('./events').MapEvent): void {
    this.events.push(event);
    this.notify();
  }

  getEvents(): import('./events').MapEvent[] {
    return [...this.events];
  }

  subscribe(listener: (events: import('./events').MapEvent[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getEvents());
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }

  clear(): void {
    this.events = [];
    this.notify();
  }

  private notify() {
    const events = this.getEvents();
    this.listeners.forEach(l => l(events));
  }
}

export const globalMapEventManager = new MapEventManager();
