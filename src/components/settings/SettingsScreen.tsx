import { useState } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { mm } from "../../domain/units";

export function SettingsScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();

  const [personSpacing, setPersonSpacing] = useState(
    String(state.settings.personSpacingMm),
  );
  const [chipDiameter, setChipDiameter] = useState(
    String(state.settings.chipDiameterMm),
  );
  const [fontSize, setFontSize] = useState(String(state.settings.fontSizeMm));
  const [snapInterval, setSnapInterval] = useState(
    String(state.settings.snapIntervalMm),
  );

  function commitPersonSpacing() {
    const value = Number(personSpacing);
    if (Number.isFinite(value) && value > 0) {
      dispatch({ type: "UPDATE_SETTINGS", patch: { personSpacingMm: mm(value) } });
    }
  }

  function commitChipDiameter() {
    const value = Number(chipDiameter);
    if (Number.isFinite(value) && value > 0) {
      dispatch({ type: "UPDATE_SETTINGS", patch: { chipDiameterMm: mm(value) } });
    }
  }

  function commitFontSize() {
    const value = Number(fontSize);
    if (Number.isFinite(value) && value > 0) {
      dispatch({ type: "UPDATE_SETTINGS", patch: { fontSizeMm: mm(value) } });
    }
  }

  function commitSnapInterval() {
    const value = Number(snapInterval);
    if (Number.isFinite(value) && value > 0) {
      dispatch({ type: "UPDATE_SETTINGS", patch: { snapIntervalMm: mm(value) } });
    }
  }

  return (
    <div className="screen">
      <h2>設定</h2>
      <p className="screen-hint">
        配置エディタでのコマの見た目や、重なり判定の基準に使う値です。
      </p>

      <div className="card">
        <div className="field-row">
          <span className="field-label">1人あたりの占有幅</span>
          <input
            type="number"
            value={personSpacing}
            onChange={(e) => setPersonSpacing(e.target.value)}
            onBlur={commitPersonSpacing}
            style={{ width: 90 }}
          />
          <span>mm</span>
        </div>

        <div className="field-row">
          <span className="field-label">コマの直径</span>
          <input
            type="number"
            value={chipDiameter}
            onChange={(e) => setChipDiameter(e.target.value)}
            onBlur={commitChipDiameter}
            style={{ width: 90 }}
          />
          <span>mm</span>
        </div>

        <div className="field-row">
          <span className="field-label">コマ内の文字サイズ</span>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            onBlur={commitFontSize}
            style={{ width: 90 }}
          />
          <span>mm</span>
        </div>

        <div className="field-row" style={{ marginBottom: 0 }}>
          <span className="field-label">グリッド吸着の間隔</span>
          <input
            type="number"
            value={snapInterval}
            onChange={(e) => setSnapInterval(e.target.value)}
            onBlur={commitSnapInterval}
            style={{ width: 90 }}
          />
          <span>mm</span>
        </div>
        <p className="screen-hint" style={{ margin: "8px 0 0" }}>
          グリッド吸着のON/OFF自体は配置エディタのサイドバーで切り替えます。
        </p>
      </div>
    </div>
  );
}
