import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { resolveDisplayNames } from "../../domain/displayName";
import { clientPointToMm } from "../../coords/pointerToMm";
import { mm } from "../../domain/units";
import type { MemberId } from "../../domain/ids";
import { UnplacedMemberList } from "./UnplacedMemberList";
import { StageSvgCanvas } from "./StageSvgCanvas";

interface DragState {
  memberId: MemberId;
  clientX: number;
  clientY: number;
}

export function PlacementEditorScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

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
          dispatch({
            type: "PLACE_MEMBER",
            memberId: drag.memberId,
            x_mm: mm(x_mm),
            y_mm: mm(y_mm),
          });
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
    // memberIdはドラッグ中に変わらないのでクロージャで固定して問題ない。
  }, [isDragging]);

  function startDrag(memberId: MemberId, e: ReactPointerEvent) {
    setDrag({ memberId, clientX: e.clientX, clientY: e.clientY });
  }

  const dragPreviewMm =
    drag && svgRef.current && groupRef.current
      ? clientPointToMm(svgRef.current, groupRef.current, drag.clientX, drag.clientY)
      : null;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <UnplacedMemberList
        members={unplacedMembers}
        parts={state.roster.parts}
        displayNames={displayNames}
        draggingMemberId={drag?.memberId ?? null}
        onDragStart={startDrag}
      />
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
          draggingMemberId={drag?.memberId ?? null}
          dragPreviewMm={dragPreviewMm}
          onChipPointerDown={startDrag}
        />
      </div>
    </div>
  );
}
