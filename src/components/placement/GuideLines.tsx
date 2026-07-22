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
      stroke="#0d9488"
      strokeWidth={3}
      strokeDasharray="20 15"
      opacity={0.5}
    />
  );
}

interface SmartGuideLinesProps {
  activeX_mm: number | null;
  activeY_mm: number | null;
  minX_mm: number;
  maxX_mm: number;
  minY_mm: number;
  maxY_mm: number;
}

// ドラッグ中、他のコマや段の境界・中心線と揃ったときに表示するスマートガイド。
export function SmartGuideLines({
  activeX_mm,
  activeY_mm,
  minX_mm,
  maxX_mm,
  minY_mm,
  maxY_mm,
}: SmartGuideLinesProps) {
  return (
    <>
      {activeX_mm !== null && (
        <line
          x1={activeX_mm}
          y1={minY_mm}
          x2={activeX_mm}
          y2={maxY_mm}
          stroke="#ff3366"
          strokeWidth={4}
          opacity={0.85}
        />
      )}
      {activeY_mm !== null && (
        <line
          x1={minX_mm}
          y1={activeY_mm}
          x2={maxX_mm}
          y2={activeY_mm}
          stroke="#ff3366"
          strokeWidth={4}
          opacity={0.85}
        />
      )}
    </>
  );
}
