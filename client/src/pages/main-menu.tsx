import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import NarrativeScreen from "@/components/narrative/NarrativeScreen";
import { loadNarrativeScript, NarrativeScript } from "@/lib/narrativeLoader";

export default function MainMenu() {
  const [, setLocation] = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [introScript, setIntroScript] = useState<NarrativeScript | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNewGame = async () => {
    setLoading(true);
    try {
      const script = await loadNarrativeScript('introduction');
      if (script) {
        setIntroScript(script);
        setShowIntro(true);
      } else {
        // If no intro script, go directly to map
        setLocation('/map');
      }
    } catch (error) {
      console.error('Failed to load intro script:', error);
      setLocation('/map');
    }
    setLoading(false);
  };

  const handleContinueGame = () => {
    // Go directly to map
    setLocation('/map');
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    setLocation('/map');
  };

  if (showIntro && introScript) {
    return (
      <NarrativeScreen
        script={introScript}
        onComplete={handleIntroComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0">
        {/* Animated forest particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-300/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-200/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-green-400/20 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-green-200/50 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Main Menu Content */}
      <div className="relative z-10 text-center space-y-8 p-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-white font-mono tracking-wider drop-shadow-2xl">
            🌿 DRUID 🌿
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-emerald-200 font-mono tracking-wide drop-shadow-lg">
            OF PEACE
          </h2>
          <p className="text-lg md:text-xl text-green-100 font-mono max-w-2xl mx-auto leading-relaxed">
            A strategic turn-based RPG where wisdom conquers violence
          </p>
        </div>

        {/* Menu Options */}
        <div className="space-y-4 max-w-md mx-auto">
          <Button
            onClick={handleNewGame}
            disabled={loading}
            variant="menu"
            className="h-14 text-xl bg-emerald-600 hover:bg-emerald-700 border-emerald-400 disabled:opacity-50"
          >
            {loading ? "🌱 LOADING..." : "🌱 NEW GAME"}
          </Button>
          
          <Button
            onClick={handleContinueGame}
            variant="menu"
            className="h-14 text-xl bg-green-600 hover:bg-green-700 border-green-400"
          >
            🗺️ CONTINUE GAME
          </Button>
          
          <Button
            onClick={() => {/* TODO: Settings */}}
            variant="menu"
            className="h-12 text-lg bg-green-700 hover:bg-green-800 border-green-500"
            disabled
          >
            ⚙️ SETTINGS
          </Button>
          
          <Button
            onClick={() => {/* TODO: Credits */}}
            variant="menu"
            className="h-12 text-lg bg-green-700 hover:bg-green-800 border-green-500"
            disabled
          >
            📜 CREDITS
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-green-200/70 font-mono text-sm">
          <p>Choose diplomacy over destruction</p>
          <p className="mt-1 text-xs">v1.0.0 - Built with wisdom and code</p>
        </div>
      </div>
    </div>
  );
}