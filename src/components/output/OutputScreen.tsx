import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { resolveDisplayNames } from "../../domain/displayName";
import { StageSvgCanvas } from "../placement/StageSvgCanvas";
import { exportSvgToPngBlob } from "../../export/exportPng";
import type { MemberId, PropId } from "../../domain/ids";

const noopMember = (_memberId: MemberId, _e: ReactPointerEvent) => {};
const noopMemberClick = (_memberId: MemberId, _e: ReactMouseEvent) => {};
const noopProp = (_propId: PropId, _e: ReactPointerEvent) => {};
const noopSelect = (_propId: PropId) => {};
const EMPTY_SELECTION: ReadonlySet<MemberId> = new Set();

export function OutputScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);

  const [title, setTitle] = useState(state.outputInfo.title);
  const [date, setDate] = useState(state.outputInfo.date);
  const [groupName, setGroupName] = useState(state.outputInfo.groupName);
  const [scale, setScale] = useState("2");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  function commitInfo(patch: Partial<typeof state.outputInfo>) {
    dispatch({ type: "UPDATE_OUTPUT_INFO", patch });
  }

  const displayNames = resolveDisplayNames(state.roster.members);

  // 書き出し中の連打で複数の巨大なcanvasを同時に確保しようとすると、
  // ブラウザによってはtoBlobが失敗することがあるため、処理中は
  // ボタンを無効化して多重実行を防ぐ。失敗時もコンソールに埋もれさせず
  // 画面上に理由を表示する。
  async function handleDownloadPng() {
    if (isExporting) return;
    const svg = svgRef.current;
    if (!svg) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await exportSvgToPngBlob(svg, Number(scale), {
        title,
        groupName,
        date,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "オーダー表"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(
        "PNGの生成に失敗しました。解像度を下げるか、しばらく待ってから再度お試しください。",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="screen">
      <h2>出力</h2>

      <div className="card">
        <h3>ヘッダー情報</h3>
        <div className="field-row">
          <span className="field-label">タイトル</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => commitInfo({ title })}
            style={{ width: 260 }}
          />
        </div>
        <div className="field-row">
          <span className="field-label">日付</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => commitInfo({ date })}
          />
        </div>
        <div className="field-row" style={{ marginBottom: 0 }}>
          <span className="field-label">団体名</span>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onBlur={() => commitInfo({ groupName })}
            style={{ width: 260 }}
          />
        </div>
      </div>

      <div className="card">
        <h3>書き出し</h3>
        <div className="field-row">
          <span className="field-label">PNG解像度</span>
          <select value={scale} onChange={(e) => setScale(e.target.value)}>
            <option value="1">1倍</option>
            <option value="2">2倍</option>
            <option value="3">3倍</option>
          </select>
          <button
            className="btn-primary"
            onClick={handleDownloadPng}
            disabled={isExporting}
          >
            {isExporting ? "書き出し中…" : "PNGをダウンロード"}
          </button>
        </div>
        {exportError && (
          <p
            style={{
              color: "var(--color-danger)",
              fontSize: "var(--font-sm)",
              margin: "-4px 0 12px",
            }}
          >
            {exportError}
          </p>
        )}
        <div className="field-row" style={{ marginBottom: 0 }}>
          <span className="field-label">印刷</span>
          <button onClick={() => window.print()}>印刷する(A4横・PDF)</button>
        </div>
      </div>

      <p className="screen-hint">プレビュー:</p>
      <div className="print-sheet">
        <div className="print-header">
          <div className="print-title">{title}</div>
          <div className="print-meta">
            {[groupName, date].filter(Boolean).join("  ")}
          </div>
        </div>
        <div className="print-stage">
          <StageSvgCanvas
            svgRef={svgRef}
            groupRef={groupRef}
            stage={state.stage}
            placements={state.placements}
            members={state.roster.members}
            parts={state.roster.parts}
            displayNames={displayNames}
            settings={state.settings}
            draggingMemberId={null}
            dragPreviewMm={null}
            onChipPointerDown={noopMember}
            selectedMemberIds={EMPTY_SELECTION}
            onChipClick={noopMemberClick}
            draggingPropId={null}
            selectedPropId={null}
            onPropPointerDown={noopProp}
            onPropClick={noopSelect}
            onBackgroundClick={() => {}}
            onBackgroundPointerDown={() => {}}
            viewportOverride={null}
            activeGuideX={null}
            activeGuideY={null}
          />
        </div>
      </div>
    </div>
  );
}
