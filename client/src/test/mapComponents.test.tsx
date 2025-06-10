import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapDebugPanel from '@/components/map/MapDebugPanel';
import TurnCounter from '@/components/map/TurnCounter';
import ForestZone from '@/components/map/ForestZone';

const sampleZone = {
  id: 'zone1',
  name: 'Forest',
  heat: 20,
  hasEncounter: false,
  position: { x: 50, y: 50 },
  icon: '🌲',
  description: '',
};

const sampleEffect = {
  id: 'mist',
  name: 'Mist',
  description: 'foggy',
  icon: '🌫️',
  effects: { druidAdvantage: {}, npcEffects: {} },
  color: '#fff',
};

describe('MapDebugPanel', () => {
  it('invokes handlers when buttons clicked', () => {
    const nextTurn = vi.fn();
    const setResolution = vi.fn();
    const startNarrative = vi.fn();
    const toggleDebug = vi.fn();
    render(
      <MapDebugPanel
        showDebugPanel={true}
        setShowDebugPanel={toggleDebug}
        resolutionMode="none"
        setResolutionMode={setResolution}
        handleNextTurn={nextTurn}
        handleNarrativeStart={startNarrative}
        currentTimePhase="day1"
        weatherState={null}
        turnCounter={1}
        getEventLog={() => []}
      />
    );

    fireEvent.click(screen.getByText('PROGRESS TURN'));
    expect(nextTurn).toHaveBeenCalled();

    fireEvent.click(screen.getByText('RESOLVE SUCCESS'));
    expect(setResolution).toHaveBeenCalledWith('success');

    fireEvent.click(screen.getByText('RESOLVE FAIL'));
    expect(setResolution).toHaveBeenCalledWith('fail');

    fireEvent.click(screen.getByText('STORY INTRO'));
    expect(startNarrative).toHaveBeenCalledWith('introduction');

    fireEvent.click(screen.getByTitle('Toggle debug panel'));
    expect(toggleDebug).toHaveBeenCalledWith(false);
  });

  it('hides actions when collapsed', () => {
    const { queryByText } = render(
      <MapDebugPanel
        showDebugPanel={false}
        setShowDebugPanel={() => {}}
        resolutionMode="none"
        setResolutionMode={() => {}}
        handleNextTurn={() => {}}
        handleNarrativeStart={() => {}}
        currentTimePhase="day1"
        weatherState={null}
        turnCounter={1}
        getEventLog={() => []}
      />
    );

    expect(queryByText('PROGRESS TURN')).toBeNull();
  });
});

describe('TurnCounter', () => {
  it('shows turn and phase', () => {
    render(<TurnCounter turn={3} timePhase="day1" weatherState={null} />);
    expect(screen.getByText('TURN')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Early Day')).toBeInTheDocument();
  });

  it('displays active weather info', () => {
    const weather = {
      activeWeather: {
        effect: { name: 'Rain', icon: '🌧️', description: 'wet' },
        remainingTurns: 2,
      },
    };
    render(<TurnCounter turn={5} timePhase="day1" weatherState={weather} />);
    expect(screen.getByText('Rain')).toBeInTheDocument();
    expect(screen.getByText('2 turns left')).toBeInTheDocument();
  });
});

describe('ForestZone', () => {
  it('renders zone name and handles click', () => {
    const handle = vi.fn();
    render(
      <ForestZone zone={sampleZone} isCurrentZone={false} onClick={handle} />
    );
    fireEvent.click(screen.getByText('Forest'));
    expect(handle).toHaveBeenCalled();
  });

  it('shows environmental effect', () => {
    render(
      <ForestZone
        zone={sampleZone}
        isCurrentZone={false}
        onClick={() => {}}
        environmentEffect={sampleEffect}
      />
    );
    expect(screen.getByText('Mist')).toBeInTheDocument();
  });
});
