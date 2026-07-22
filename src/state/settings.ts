import { mm } from "../domain/units";
import type { Millimeter } from "../domain/units";

export interface Settings {
  // 1人あたりの占有幅。重なり警告の判定基準に使う。
  personSpacingMm: Millimeter;
  // コマの描画直径
  chipDiameterMm: Millimeter;
  // コマ内に表示する文字のサイズ
  fontSizeMm: Millimeter;
  // グリッド吸着の間隔(ON/OFFは配置エディタ側のUI状態で切り替える)
  snapIntervalMm: Millimeter;
}

// 要件定義8章の未決事項(初期値は実装しながら調整)に基づく暫定値。
export const defaultSettings: Settings = {
  personSpacingMm: mm(500),
  chipDiameterMm: mm(400),
  fontSizeMm: mm(120),
  snapIntervalMm: mm(50),
};
