import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { resolveDisplayNames } from "../../domain/displayName";
import { clientPointToMm } from "../../coords/pointerToMm";
import { mm } from "../../domain/units";
import type { MemberId, PropId } from "../../domain/ids";
import type { ViewBoxRect } from "../../coords/viewBox";
import { UnplacedMemberList } from "./UnplacedMemberList";
import { StageSvgCanvas } from "./StageSvgCanvas";

type DragTarget =
  | { kind: "member"; id: MemberId }
  | { kind: "prop"; id: PropId };

interface DragState {
  target: DragTarget;
  clientX: number;
  clientY: number;
}

interface PanStart {
  startClientX: number;
  startClientY: number;
  startViewBox: ViewBoxRect;
  ctmA: number;
  ctmD: number;
}

const PAN_MOVE_THRESHOLD_PX = 3;
const ZOOM_MIN_PERCENT = 25;
const ZOOM_MAX_PERCENT = 300;
const ZOOM_DEFAULT_PERCENT = 100;

export function PlacementEditorScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selectedPropId, setSelectedPropId] = useState<PropId | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<MemberId>>(
    () => new Set(),
  );
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [viewportOverride, setViewportOverride] = useState<ViewBoxRect | null>(
    null,
  );
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef<PanStart | null>(null);
  const didPanMoveRef = useRef(false);
  const [zoomPercent, setZoomPercent] = useState(ZOOM_DEFAULT_PERCENT);
  // ズームスライダーの「100%」の基準となる大きさ(自動フィット時の実測値)。
  // 最初にスライダーを動かした時点の値を固定して使う。中心位置は
  // 常にそのつどのviewBoxから読むため、パンした位置はズームで
  // リセットされない。
  const zoomBaseSizeRef = useRef<{ width: number; height: number } | null>(
    null,
  );

  const displayNames = useMemo(
    () => resolveDisplayNames(state.roster.members),
    [state.roster.members],
  );

  const unplacedMembers = state.roster.members.filter(
    (m) => m.isPresent && !state.placements[m.id],
  );

  const isDragging = drag !== null;

  useEffect(() => {
    if (!drag) return;

    function handleMove(e: PointerEvent) {
      setDrag((prev) =>
        prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : prev,
      );
    }

    function handleUp(e: PointerEvent) {
      const svg = svgRef.current;
      const group = groupRef.current;
      if (svg && group && drag) {
        const rect = svg.getBoundingClientRect();
        const isInsideCanvas =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (isInsideCanvas) {
          const rawMm = clientPointToMm(svg, group, e.clientX, e.clientY);
          const interval = state.settings.snapIntervalMm;
          const snap = (v: number) =>
            snapEnabled ? Math.round(v / interval) * interval : v;
          const x_mm = snap(rawMm.x_mm);
          const y_mm = snap(rawMm.y_mm);
          if (drag.target.kind === "member") {
            dispatch({
              type: "PLACE_MEMBER",
              memberId: drag.target.id,
              x_mm: mm(x_mm),
              y_mm: mm(y_mm),
            });
          } else {
            dispatch({
              type: "MOVE_PROP",
              propId: drag.target.id,
              x_mm: mm(x_mm),
              y_mm: mm(y_mm),
            });
          }
        }
      }
      setDrag(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // drag.clientX/Yの更新のたびにリスナーを張り直さないよう、
    // 依存はドラッグの開始/終了(isDragging)だけにする。
    // targetはドラッグ中に変わらないのでクロージャで固定して問題ない。
  }, [isDragging]);

  // 背景ドラッグでのパン。ドラッグ開始時のviewBoxとCTMを基準に、
  // ポインタのクライアント座標の移動量をmmへ変換して適用する。
  useEffect(() => {
    if (!isPanning) return;

    function handleMove(e: PointerEvent) {
      const p = panRef.current;
      if (!p) return;
      const deltaClientX = e.clientX - p.startClientX;
      const deltaClientY = e.clientY - p.startClientY;
      if (
        Math.abs(deltaClientX) > PAN_MOVE_THRESHOLD_PX ||
        Math.abs(deltaClientY) > PAN_MOVE_THRESHOLD_PX
      ) {
        didPanMoveRef.current = true;
      }
      const deltaMmX = deltaClientX / p.ctmA;
      const deltaMmY = deltaClientY / p.ctmD;
      setViewportOverride({
        x: p.startViewBox.x - deltaMmX,
        y: p.startViewBox.y - deltaMmY,
        width: p.startViewBox.width,
        height: p.startViewBox.height,
      });
    }

    function handleUp() {
      panRef.current = null;
      setIsPanning(false);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isPanning]);

  // ズームスライダー。トラックパッドのジェスチャー(ホイール)には
  // 依存せず、スライダーの値だけでviewBoxを決める。
  // 初回操作時の自動フィットのviewBoxを基準(100%)として固定し、
  // その基準に対する拡大率でwidth/heightを再計算する。
  function applyZoom(percent: number) {
    setZoomPercent(percent);
    const svg = svgRef.current;
    if (!svg) return;
    const vbNow = svg.viewBox.baseVal;

    if (!zoomBaseSizeRef.current) {
      zoomBaseSizeRef.current = { width: vbNow.width, height: vbNow.height };
    }
    const base = zoomBaseSizeRef.current;
    const scaleRatio = ZOOM_DEFAULT_PERCENT / percent;
    const newWidth = base.width * scaleRatio;
    const newHeight = base.height * scaleRatio;
    // 中心は現在表示中の範囲から求める(パンした位置を維持するため)。
    const centerX = vbNow.x + vbNow.width / 2;
    const centerY = vbNow.y + vbNow.height / 2;

    setViewportOverride({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight,
    });
  }

  function resetView() {
    setViewportOverride(null);
    setZoomPercent(ZOOM_DEFAULT_PERCENT);
    zoomBaseSizeRef.current = null;
  }

  function startPan(e: ReactPointerEvent) {
    const svg = svgRef.current;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const vb = svg.viewBox.baseVal;
    panRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startViewBox: { x: vb.x, y: vb.y, width: vb.width, height: vb.height },
      ctmA: ctm.a,
      ctmD: ctm.d,
    };
    didPanMoveRef.current = false;
    setIsPanning(true);
  }

  function handleBackgroundClick() {
    if (didPanMoveRef.current) {
      didPanMoveRef.current = false;
      return;
    }
    clearSelection();
  }

  function startDragMember(memberId: MemberId, e: ReactPointerEvent) {
    setDrag({ target: { kind: "member", id: memberId }, clientX: e.clientX, clientY: e.clientY });
  }

  function startDragProp(propId: PropId, e: ReactPointerEvent) {
    setDrag({ target: { kind: "prop", id: propId }, clientX: e.clientX, clientY: e.clientY });
  }

  function selectProp(propId: PropId) {
    setSelectedPropId(propId);
    setSelectedMemberIds(new Set());
  }

  function handleChipClick(memberId: MemberId, e: ReactMouseEvent) {
    setSelectedPropId(null);
    setSelectedMemberIds((prev) => {
      const isMultiSelect = e.shiftKey || e.metaKey || e.ctrlKey;
      if (!isMultiSelect) {
        return prev.size === 1 && prev.has(memberId) ? new Set() : new Set([memberId]);
      }
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedPropId(null);
    setSelectedMemberIds(new Set());
  }

  function handleUnplaceSelected() {
    dispatch({
      type: "UNPLACE_MEMBERS",
      memberIds: [...selectedMemberIds],
    });
    setSelectedMemberIds(new Set());
  }

  function handleAlignSelected() {
    dispatch({
      type: "ALIGN_MEMBERS_ROW",
      memberIds: [...selectedMemberIds],
    });
  }

  const dragPreviewMm =
    drag && svgRef.current && groupRef.current
      ? clientPointToMm(svgRef.current, groupRef.current, drag.clientX, drag.clientY)
      : null;

  const draggingMemberId =
    drag?.target.kind === "member" ? drag.target.id : null;
  const draggingPropId = drag?.target.kind === "prop" ? drag.target.id : null;

  const selectedProp = state.stage.props.find((p) => p.id === selectedPropId) ?? null;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div className="placement-sidebar">
        <UnplacedMemberList
          members={unplacedMembers}
          parts={state.roster.parts}
          displayNames={displayNames}
          draggingMemberId={draggingMemberId}
          onDragStart={startDragMember}
        />

        <div className="sidebar-section">
          <div className="sidebar-section-title">表示</div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>ズーム</span>
              <span>{zoomPercent}%</span>
            </div>
            <input
              type="range"
              min={ZOOM_MIN_PERCENT}
              max={ZOOM_MAX_PERCENT}
              step={5}
              value={zoomPercent}
              onChange={(e) => applyZoom(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <label
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
          >
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={(e) => setSnapEnabled(e.target.checked)}
            />
            グリッド吸着({state.settings.snapIntervalMm}mm間隔)
          </label>
          <button className="btn-small" style={{ marginTop: 8 }} onClick={resetView}>
            表示をリセット
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">指揮者・ピアノ</div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              className="btn-small"
              onClick={() => dispatch({ type: "ADD_PROP", propType: "conductor" })}
            >
              + 指揮者
            </button>
            <button
              className="btn-small"
              onClick={() => dispatch({ type: "ADD_PROP", propType: "piano" })}
            >
              + ピアノ
            </button>
          </div>

          {selectedProp && (
            <div className="selection-panel">
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                選択中: <strong>{selectedProp.label ?? selectedProp.type}</strong>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {selectedProp.type === "piano" && (
                  <>
                    <button
                      className="btn-small"
                      onClick={() =>
                        dispatch({
                          type: "ROTATE_PROP",
                          propId: selectedProp.id,
                          deltaDeg: -30,
                        })
                      }
                    >
                      ↺ 左回り
                    </button>
                    <button
                      className="btn-small"
                      onClick={() =>
                        dispatch({
                          type: "ROTATE_PROP",
                          propId: selectedProp.id,
                          deltaDeg: 30,
                        })
                      }
                    >
                      ↻ 右回り
                    </button>
                  </>
                )}
                <button
                  className="btn-small btn-danger"
                  onClick={() => {
                    dispatch({ type: "REMOVE_PROP", propId: selectedProp.id });
                    setSelectedPropId(null);
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          )}

          {selectedMemberIds.size > 0 && (
            <div className="selection-panel">
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                選択中: <strong>{selectedMemberIds.size}名</strong>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  (shift+クリックで複数選択)
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button className="btn-small" onClick={handleUnplaceSelected}>
                  未配置に戻す
                </button>
                {selectedMemberIds.size >= 2 && (
                  <button className="btn-small" onClick={handleAlignSelected}>
                    横一列に整列
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <StageSvgCanvas
          svgRef={svgRef}
          groupRef={groupRef}
          stage={state.stage}
          placements={state.placements}
          members={state.roster.members}
          parts={state.roster.parts}
          displayNames={displayNames}
          settings={state.settings}
          draggingMemberId={draggingMemberId}
          dragPreviewMm={dragPreviewMm}
          onChipPointerDown={startDragMember}
          selectedMemberIds={selectedMemberIds}
          onChipClick={handleChipClick}
          draggingPropId={draggingPropId}
          selectedPropId={selectedPropId}
          onPropPointerDown={startDragProp}
          onPropClick={selectProp}
          onBackgroundClick={handleBackgroundClick}
          onBackgroundPointerDown={startPan}
          viewportOverride={viewportOverride}
        />
      </div>
    </div>
  );
}
