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
    <div className="sidebar-section" style={{ flex: 1, overflowY: "auto" }}>
      <div className="sidebar-section-title">未配置({members.length}名)</div>
      {members.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
          全員配置済みです
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {members.map((m) => (
            <li
              key={m.id}
              onPointerDown={(e) => onDragStart(m.id, e)}
              className={
                "unplaced-item" +
                (draggingMemberId === m.id ? " is-dragging" : "")
              }
            >
              <span
                className="unplaced-item-dot"
                style={{ background: colorByPartId.get(m.partId) ?? "#999" }}
              />
              <span>{displayNames.get(m.id) ?? m.familyName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
