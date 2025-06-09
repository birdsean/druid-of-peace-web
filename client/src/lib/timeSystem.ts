export type TimePhase = 'day1' | 'day2' | 'day3' | 'dusk' | 'night1' | 'night2' | 'night3' | 'dawn';

export interface TimeState {
  currentPhase: TimePhase;
  phaseIndex: number;
  turnCounter: number;
}

export interface PhaseInfo {
  name: string;
  icon: string;
  effectId: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

const TIME_PHASES: TimePhase[] = [
  'day1', 'day2', 'day3', 'dusk', 'night1', 'night2', 'night3', 'dawn'
];

const PHASE_INFO: Record<TimePhase, PhaseInfo> = {
  day1: {
    name: 'Early Day',
    icon: '🌅',
    effectId: 'daylight',
    colorPalette: {
      primary: '#22c55e',   // bright green
      secondary: '#3b82f6', // bright blue
      accent: '#fbbf24',    // golden yellow
      background: '#dbeafe' // light blue
    }
  },
  day2: {
    name: 'Midday',
    icon: '☀️',
    effectId: 'daylight',
    colorPalette: {
      primary: '#16a34a',   // green
      secondary: '#2563eb', // blue
      accent: '#f59e0b',    // amber
      background: '#bfdbfe' // sky blue
    }
  },
  day3: {
    name: 'Late Day',
    icon: '🌤️',
    effectId: 'daylight',
    colorPalette: {
      primary: '#15803d',   // darker green
      secondary: '#1d4ed8', // darker blue
      accent: '#d97706',    // orange
      background: '#93c5fd' // lighter blue
    }
  },
  dusk: {
    name: 'Dusk',
    icon: '🌆',
    effectId: 'dusk',
    colorPalette: {
      primary: '#dc2626',   // red
      secondary: '#7c3aed', // purple
      accent: '#f97316',    // orange
      background: '#fde68a' // warm yellow
    }
  },
  night1: {
    name: 'Early Night',
    icon: '🌙',
    effectId: 'night',
    colorPalette: {
      primary: '#1e293b',   // dark slate
      secondary: '#334155', // slate
      accent: '#6366f1',    // indigo
      background: '#0f172a' // very dark
    }
  },
  night2: {
    name: 'Midnight',
    icon: '🌌',
    effectId: 'night',
    colorPalette: {
      primary: '#0f172a',   // very dark
      secondary: '#1e293b', // dark slate
      accent: '#4338ca',    // darker indigo
      background: '#020617' // nearly black
    }
  },
  night3: {
    name: 'Late Night',
    icon: '🌃',
    effectId: 'night',
    colorPalette: {
      primary: '#1e293b',   // dark slate
      secondary: '#334155', // slate
      accent: '#5b21b6',    // purple
      background: '#0f172a' // very dark
    }
  },
  dawn: {
    name: 'Dawn',
    icon: '🌄',
    effectId: 'dawn',
    colorPalette: {
      primary: '#ec4899',   // pink
      secondary: '#a855f7', // purple
      accent: '#f472b6',    // light pink
      background: '#fdf2f8' // very light pink
    }
  }
};

export class TimeManager {
  private state: TimeState;
  private listeners: Array<(state: TimeState) => void> = [];

  constructor(initialPhase: TimePhase = 'day1', initialTurn: number = 1) {
    this.state = {
      currentPhase: initialPhase,
      phaseIndex: TIME_PHASES.indexOf(initialPhase),
      turnCounter: initialTurn
    };
  }

  getState(): TimeState {
    return { ...this.state };
  }

  getCurrentPhaseInfo(): PhaseInfo {
    return PHASE_INFO[this.state.currentPhase];
  }

  advancePhase(): TimeState {
    this.state.phaseIndex = (this.state.phaseIndex + 1) % TIME_PHASES.length;
    this.state.currentPhase = TIME_PHASES[this.state.phaseIndex];
    this.state.turnCounter++;
    
    this.notifyListeners();
    return this.getState();
  }

  setPhase(phase: TimePhase): TimeState {
    this.state.currentPhase = phase;
    this.state.phaseIndex = TIME_PHASES.indexOf(phase);
    
    this.notifyListeners();
    return this.getState();
  }

  subscribe(listener: (state: TimeState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Debug methods
  getAllPhases(): TimePhase[] {
    return [...TIME_PHASES];
  }

  getPhaseInfo(phase: TimePhase): PhaseInfo {
    return PHASE_INFO[phase];
  }
}

// Global time manager instance
export const globalTimeManager = new TimeManager();

// Helper functions
export function getTimeBasedEnvironmentalEffect(phase: TimePhase) {
  const phaseInfo = PHASE_INFO[phase];
  return {
    id: phaseInfo.effectId,
    zone_id: null,
    appliesIn: "battle" as const,
    type: "dynamic" as const,
    duration: 1
  };
}

export function getTimeBasedGradient(phase: TimePhase): string {
  const gradients: Record<TimePhase, string> = {
    day1: 'bg-gradient-to-b from-sky-300 via-blue-200 to-green-300',
    day2: 'bg-gradient-to-b from-blue-400 via-sky-300 to-green-400', 
    day3: 'bg-gradient-to-b from-orange-300 via-yellow-200 to-green-300',
    dusk: 'bg-gradient-to-b from-purple-400 via-pink-300 to-orange-400',
    night1: 'bg-gradient-to-b from-purple-800 via-indigo-700 to-blue-800',
    night2: 'bg-gradient-to-b from-indigo-900 via-purple-800 to-slate-800',
    night3: 'bg-gradient-to-b from-slate-800 via-indigo-800 to-purple-700',
    dawn: 'bg-gradient-to-b from-pink-300 via-rose-200 to-orange-300'
  };
  return gradients[phase];
}

export function applyPhaseColorPalette(phase: TimePhase, element?: HTMLElement) {
  const palette = PHASE_INFO[phase].colorPalette;
  const root = element || document.documentElement;
  
  root.style.setProperty('--time-primary', palette.primary);
  root.style.setProperty('--time-secondary', palette.secondary);
  root.style.setProperty('--time-accent', palette.accent);
  root.style.setProperty('--time-background', palette.background);
}