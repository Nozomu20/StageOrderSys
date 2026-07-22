interface GuideLinesProps {
  minY_mm: number;
  maxY_mm: number;
}

// ステージ中央の中心線。段の境界は各段の矩形の枠線自体で示されているため、
// ここでは追加で中心線だけを描く。
export function GuideLines({ minY_mm, maxY_mm }: GuideLinesProps) {
  return (
    <line
      x1={0}
      y1={minY_mm}
      x2={0}
      y2={maxY_mm}
      stroke="#2a78d6"
      strokeWidth={3}
      strokeDasharray="20 15"
      opacity={0.5}
    />
  );
}
