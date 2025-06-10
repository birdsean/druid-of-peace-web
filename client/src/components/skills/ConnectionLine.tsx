export interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  active: boolean;
}

export default function ConnectionLine({ from, to, color, active }: ConnectionLineProps) {
  const length = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2),
  );
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

  return (
    <div
      role="presentation"
      className="absolute origin-left transition-all duration-300"
      style={{
        left: `${from.x}px`,
        top: `${from.y}px`,
        width: `${length}px`,
        height: '3px',
        backgroundColor: active ? color : '#4b5563',
        transform: `rotate(${angle}deg)`,
        opacity: active ? 1 : 0.3,
        zIndex: 1,
      }}
    />
  );
}
