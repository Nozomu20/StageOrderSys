import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { resolveDisplayNames } from "../../domain/displayName";
import { clientPointToMm } from "../../coords/pointerToMm";
import { mm } from "../../domain/units";
import type { MemberId, PropId } from "../../domain/ids";
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

export function PlacementEditorScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selectedPropId, setSelectedPropId] = useState<PropId | null>(null);

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
          const { x_mm, y_mm } = clientPointToMm(
            svg,
            group,
            e.clientX,
            e.clientY,
          );
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

  function startDragMember(memberId: MemberId, e: ReactPointerEvent) {
    setDrag({ target: { kind: "member", id: memberId }, clientX: e.clientX, clientY: e.clientY });
  }

  function startDragProp(propId: PropId, e: ReactPointerEvent) {
    setDrag({ target: { kind: "prop", id: propId }, clientX: e.clientX, clientY: e.clientY });
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
      <div style={{ width: 220, display: "flex", flexDirection: "column" }}>
        <UnplacedMemberList
          members={unplacedMembers}
          parts={state.roster.parts}
          displayNames={displayNames}
          draggingMemberId={draggingMemberId}
          onDragStart={startDragMember}
        />
        <div style={{ borderTop: "1px solid #ccc", padding: 8 }}>
          <button onClick={() => dispatch({ type: "ADD_PROP", propType: "conductor" })}>
            指揮者を追加
          </button>
          <button
            onClick={() => dispatch({ type: "ADD_PROP", propType: "piano" })}
            style={{ marginLeft: 4 }}
          >
            ピアノを追加
          </button>

          {selectedProp && (
            <div style={{ marginTop: 8 }}>
              <div>選択中: {selectedProp.label ?? selectedProp.type}</div>
              {selectedProp.type === "piano" && (
                <div>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "ROTATE_PROP",
                        propId: selectedProp.id,
                        deltaDeg: -30,
                      })
                    }
                  >
                    左回り
                  </button>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "ROTATE_PROP",
                        propId: selectedProp.id,
                        deltaDeg: 30,
                      })
                    }
                    style={{ marginLeft: 4 }}
                  >
                    右回り
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  dispatch({ type: "REMOVE_PROP", propId: selectedProp.id });
                  setSelectedPropId(null);
                }}
                style={{ marginTop: 4 }}
              >
                削除
              </button>
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
          draggingPropId={draggingPropId}
          selectedPropId={selectedPropId}
          onPropPointerDown={startDragProp}
          onPropClick={setSelectedPropId}
        />
      </div>
    </div>
  );
}
