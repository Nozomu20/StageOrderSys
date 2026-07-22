import type { PointerEvent as ReactPointerEvent } from "react";
import type { Member, Part } from "../../domain/roster";
import type { MemberId } from "../../domain/ids";

interface UnplacedMemberListProps {
  members: Member[];
  parts: Part[];
  displayNames: Map<MemberId, string>;
  draggingMemberId: MemberId | null;
  onDragStart: (memberId: MemberId, e: ReactPointerEvent) => void;
}

export function UnplacedMemberList({
  members,
  parts,
  displayNames,
  draggingMemberId,
  onDragStart,
}: UnplacedMemberListProps) {
  const colorByPartId = new Map(parts.map((p) => [p.id, p.color]));

  return (
    <div style={{ width: 220, overflowY: "auto", borderRight: "1px solid #ccc" }}>
      <h3 style={{ fontSize: 14, padding: "4px 8px" }}>
        未配置 ({members.length}名)
      </h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {members.map((m) => (
          <li
            key={m.id}
            onPointerDown={(e) => onDragStart(m.id, e)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              cursor: "grab",
              userSelect: "none",
              opacity: draggingMemberId === m.id ? 0.4 : 1,
              touchAction: "none",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: colorByPartId.get(m.partId) ?? "#999",
              }}
            />
            <span>{displayNames.get(m.id) ?? m.familyName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
