interface DruidCharacterProps {
  hidden: boolean;
}

export default function DruidCharacter({ hidden }: DruidCharacterProps) {
  return (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
      <div className={`relative ${hidden ? "opacity-60" : "opacity-100"}`}>
        <div className="w-16 h-20 bg-green-600 rounded-lg flex items-center justify-center">
          <div className="text-2xl">🧙</div>
        </div>
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          <div className="text-xs font-mono text-green-400">
            {hidden ? "HIDDEN" : "REVEALED"}
          </div>
        </div>
      </div>
    </div>
  );
}
