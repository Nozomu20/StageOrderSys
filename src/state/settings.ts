import { mm } from "../domain/units";
import type { Millimeter } from "../domain/units";

export interface Settings {
  // 1人あたりの占有幅。重なり警告(第2段階以降)の判定基準に使う想定。
  personSpacingMm: Millimeter;
  // コマの描画直径
  chipDiameterMm: Millimeter;
  // コマ内に表示する文字のサイズ
  fontSizeMm: Millimeter;
}

// 要件定義8章の未決事項(初期値は実装しながら調整)に基づく暫定値。
export const defaultSettings: Settings = {
  personSpacingMm: mm(500),
  chipDiameterMm: mm(400),
  fontSizeMm: mm(120),
};
