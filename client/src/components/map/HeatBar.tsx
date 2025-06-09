import { cn } from "@/lib/utils";

interface HeatBarProps {
  heat: number;
}

function getHeatLevel(heat: number): string {
  if (heat <= 10) return "None";
  if (heat <= 30) return "Cold";
  if (heat <= 50) return "Cool";
  if (heat <= 70) return "Warm";
  if (heat <= 90) return "Hot";
  return "Critical";
}

function getHeatColor(heat: number): string {
  if (heat <= 10) return "bg-blue-500";
  if (heat <= 30) return "bg-cyan-500";
  if (heat <= 50) return "bg-green-500";
  if (heat <= 70) return "bg-yellow-500";
  if (heat <= 90) return "bg-orange-500";
  return "bg-red-500";
}

export default function HeatBar({ heat }: HeatBarProps) {
  const level = getHeatLevel(heat);
  const colorClass = getHeatColor(heat);
  
  return (
    <div 
      className="relative group"
      title={`Heat: ${heat} – ${level}. Higher heat makes conflict more likely.`}
    >
      {/* Heat Bar Background */}
      <div className="w-16 h-2 bg-gray-300 rounded-full border border-gray-400">
        {/* Heat Bar Fill */}
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClass,
            heat >= 90 && "animate-pulse"
          )}
          style={{ width: `${heat}%` }}
        />
      </div>
      
      {/* Heat Value */}
      <div className="text-xs text-white font-mono text-center mt-1 bg-black bg-opacity-70 rounded px-1">
        {heat}
      </div>
      
      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
        Heat: {heat} – {level}
        <br />
        Higher heat makes conflict more likely
      </div>
    </div>
  );
}