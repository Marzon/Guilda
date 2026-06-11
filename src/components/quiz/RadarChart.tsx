import { RADAR_LABELS } from "@/data/quizData";

interface RadarChartProps {
  values: number[];
  color: string;
}

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 95;
const LEVELS = 4;

function polarToCartesian(angle: number, radius: number): [number, number] {
  // Start from top (-90deg) and go clockwise
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function getAngles(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (360 / count) * i);
}

export function RadarChart({ values, color }: RadarChartProps) {
  const angles = getAngles(5);

  // Grid polygons
  const gridPolygons = Array.from({ length: LEVELS }, (_, level) => {
    const r = (RADIUS / LEVELS) * (level + 1);
    const points = angles.map((a) => polarToCartesian(a, r).join(",")).join(" ");
    return <polygon key={level} points={points} fill="none" stroke="white" strokeOpacity={0.1} />;
  });

  // Axis lines
  const axisLines = angles.map((a, i) => {
    const [x, y] = polarToCartesian(a, RADIUS);
    return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="white" strokeOpacity={0.1} />;
  });

  // Data polygon
  const dataPoints = angles.map((a, i) => {
    const r = (values[i] / 100) * RADIUS;
    return polarToCartesian(a, r);
  });
  const dataPath = dataPoints.map((p) => p.join(",")).join(" ");

  // Labels
  const labels = angles.map((a, i) => {
    const [x, y] = polarToCartesian(a, RADIUS + 24);
    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#B8A5D0"
        fontSize={11}
        fontWeight={500}
      >
        {RADAR_LABELS[i]}
      </text>
    );
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px] mx-auto">
      {gridPolygons}
      {axisLines}
      <polygon
        points={dataPath}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={2}
      />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={color} />
      ))}
      {labels}
    </svg>
  );
}
