import { MmText } from "./MmText";

interface AudienceSideLabelProps {
  y_mm: number;
}

// 客席から見た向きで描いているため、団員が自分の立ち位置を確認する際に
// 左右が逆に感じられないよう、客席側であることを必ず示す(要件定義2章)。
export function AudienceSideLabel({ y_mm }: AudienceSideLabelProps) {
  return (
    <MmText x_mm={0} y_mm={y_mm} fontSize_mm={90}>
      客席側 ↓
    </MmText>
  );
}
