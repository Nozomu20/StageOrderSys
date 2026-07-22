import type { PointerEvent as ReactPointerEvent } from "react";
import type { Prop } from "../../domain/stage";
import type { PropId } from "../../domain/ids";
import { MmText } from "./MmText";

interface PropsLayerProps {
  props: Prop[];
  chipDiameter_mm: number;
  fontSize_mm: number;
  selectedPropId: PropId | null;
  onPropPointerDown: (propId: PropId, e: ReactPointerEvent) => void;
  onPropClick: (propId: PropId) => void;
}

// グランドピアノを上から見た簡略形。原点(0,0)を鍵盤側の中心とし、
// +y方向(要件定義の座標系では舞台奥)に向かって広がる。実測に基づく
// 正確な形ではなく、あくまで模式図(要件定義8章の未決事項)。
// サイズは山台(BOARD_CATALOG)の1枚分程度(横幅1400mm前後)に収まるよう調整。
const PIANO_PATH = `
  M -490,0 L 490,0
  Q 910,-350 140,-1085
  L -455,-1050
  Q -525,-490 -490,0
  Z
`;

export function PropsLayer({
  props,
  chipDiameter_mm,
  fontSize_mm,
  selectedPropId,
  onPropPointerDown,
  onPropClick,
}: PropsLayerProps) {
  return (
    <>
      {props.map((prop) => {
        const isSelected = prop.id === selectedPropId;
        if (prop.type === "conductor") {
          return (
            <g key={prop.id}>
              <circle
                cx={prop.x_mm}
                cy={prop.y_mm}
                r={chipDiameter_mm / 2}
                fill="#333333"
                stroke={isSelected ? "#0d9488" : "#000000"}
                strokeWidth={isSelected ? 10 : 4}
                style={{ cursor: "grab", touchAction: "none" }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onPropPointerDown(prop.id, e);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPropClick(prop.id);
                }}
              />
              <MmText
                x_mm={prop.x_mm}
                y_mm={prop.y_mm}
                fontSize_mm={fontSize_mm}
              >
                {prop.label ?? "指揮"}
              </MmText>
            </g>
          );
        }

        return (
          <g
            key={prop.id}
            transform={`translate(${prop.x_mm}, ${prop.y_mm}) rotate(${prop.angle_deg})`}
          >
            <path
              d={PIANO_PATH}
              fill="#222222"
              stroke={isSelected ? "#0d9488" : "#000000"}
              strokeWidth={isSelected ? 10 : 4}
              style={{ cursor: "grab", touchAction: "none" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onPropPointerDown(prop.id, e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onPropClick(prop.id);
              }}
            />
          </g>
        );
      })}
    </>
  );
}
