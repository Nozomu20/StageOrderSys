import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { resolveDisplayNames } from "../../domain/displayName";
import { StageSvgCanvas } from "../placement/StageSvgCanvas";
import { exportSvgToPngBlob } from "../../export/exportPng";
import type { MemberId, PropId } from "../../domain/ids";

const noopMember = (_memberId: MemberId, _e: ReactPointerEvent) => {};
const noopProp = (_propId: PropId, _e: ReactPointerEvent) => {};
const noopSelect = (_propId: PropId) => {};

export function OutputScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);

  const [title, setTitle] = useState(state.outputInfo.title);
  const [date, setDate] = useState(state.outputInfo.date);
  const [groupName, setGroupName] = useState(state.outputInfo.groupName);
  const [scale, setScale] = useState("2");

  function commitInfo(patch: Partial<typeof state.outputInfo>) {
    dispatch({ type: "UPDATE_OUTPUT_INFO", patch });
  }

  const displayNames = resolveDisplayNames(state.roster.members);

  async function handleDownloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
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
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>出力</h2>

      <div style={{ marginBottom: 8 }}>
        タイトル:{" "}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => commitInfo({ title })}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        日付:{" "}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => commitInfo({ date })}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        団体名:{" "}
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onBlur={() => commitInfo({ groupName })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        PNG解像度:{" "}
        <select value={scale} onChange={(e) => setScale(e.target.value)}>
          <option value="1">1倍</option>
          <option value="2">2倍</option>
          <option value="3">3倍</option>
        </select>
        <button onClick={handleDownloadPng} style={{ marginLeft: 8 }}>
          PNGをダウンロード
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => window.print()}>印刷する(A4横・PDF)</button>
      </div>

      <p style={{ fontSize: 12, color: "#666" }}>プレビュー:</p>
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
            draggingPropId={null}
            selectedPropId={null}
            onPropPointerDown={noopProp}
            onPropClick={noopSelect}
          />
        </div>
      </div>
    </div>
  );
}
